import React, { useCallback, useEffect, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { useStore } from 'zustand';

import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { useAsRef } from 'src/hooks/useAsRef';
import { getLayoutComponentObject, getNodeConstructor } from 'src/layout';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { NodesInternal, useIsHiddenViaRules } from 'src/utils/layout/NodesContext';
import { NodeGeneratorDebug } from 'src/utils/layout/NodesGenerator';
import { NodeGeneratorInternal, NodesGeneratorProvider } from 'src/utils/layout/NodesGeneratorContext';
import { useResolvedExpression } from 'src/utils/layout/useResolvedExpression';
import type { SimpleEval } from 'src/features/expressions';
import type { ExprConfig, ExprResolved, ExprValToActual, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { CompDef } from 'src/layout';
import type { FormComponentProps, SummarizableComponentProps } from 'src/layout/common.generated';
import type {
  CompExternal,
  CompExternalExact,
  CompInternal,
  CompTypes,
  HierarchyDataSources,
  ITextResourceBindings,
} from 'src/layout/layout';
import type { BasicNodeGeneratorProps, ExprResolver } from 'src/layout/LayoutComponent';
import type { StateFactoryProps } from 'src/utils/layout/itemState';
import type { LayoutNode, LayoutNodeProps } from 'src/utils/layout/LayoutNode';

/**
 * A node generator will always be rendered when a component is present in a layout, even if the component
 * normally is hidden, the user is on another page, or the component is not visible for some other reason.
 *
 * Its job is to use relevant data sources to evaluate expressions in the item/component configuration,
 * and update other states needed by the component to function. We do this so that the node hierarchy
 * can always be up-to-date, and so that we can implement effects for components that run even when the
 * component is not visible/rendered.
 */
export function DefaultNodeGenerator({ children, baseId }: PropsWithChildren<BasicNodeGeneratorProps>) {
  const layoutMap = NodeGeneratorInternal.useLayoutMap();
  const parent = NodeGeneratorInternal.useParent();
  const item = useItem(layoutMap[baseId]);
  const path = usePath(item);
  const node = useNewNode(item, path);
  const page = NodeGeneratorInternal.usePage();
  const isTopLevel = parent === page;
  const isTopLevelRef = useAsRef(isTopLevel);
  const removeTopLevelNode = NodesInternal.useRemoveTopLevelNode();
  const nodeRef = useAsRef(node);
  const pageRef = useAsRef(page);

  const hiddenByParent = NodeGeneratorInternal.useIsHiddenByParent();
  const hiddenByExpression = useResolvedExpression(ExprVal.Boolean, node, item.hidden, false);
  const hiddenByRule = useIsHiddenViaRules(node);
  const hidden = hiddenByExpression || hiddenByRule || hiddenByParent;

  useEffect(
    () => () => {
      pageRef.current._removeChild(nodeRef.current);
      if (isTopLevelRef.current) {
        removeTopLevelNode(nodeRef.current);
      } else {
        throw new Error('Child components are not supported yet.');
      }
    },
    [isTopLevelRef, nodeRef, pageRef, removeTopLevelNode],
  );

  return (
    <>
      <NodeResolver
        item={item}
        hidden={hidden}
        node={node}
      />
      <NodesGeneratorProvider
        parent={node}
        hidden={hidden}
      >
        {children}
      </NodesGeneratorProvider>
    </>
  );
}

interface NodeResolverProps<T extends CompTypes> {
  node: LayoutNode<T>;
  hidden: boolean;
  item: CompExternal<T>;
}

function NodeResolver<T extends CompTypes = CompTypes>({ node, hidden, item }: NodeResolverProps<T>) {
  const page = NodeGeneratorInternal.usePage();
  const parent = NodeGeneratorInternal.useParent();
  const row = NodeGeneratorInternal.useRow();
  const isTopLevel = parent === page;
  const resolverProps = useExpressionResolverProps(node, item);

  const def = useDef(item.type);
  const setNodeProp = useStore(node.store, (state) => state.setNodeProp);
  const resolvedItem = useMemo(
    () => (def as CompDef<T>).evalExpressions(resolverProps as any) as CompInternal<T>,
    [def, resolverProps],
  );

  const stateFactoryProps = useAsRef<StateFactoryProps<T>>({ item: item as any, parent, row });
  const addTopLevelNode = NodesInternal.useAddTopLevelNode();
  useEffect(() => {
    const defaultState = node.def.stateFactory(stateFactoryProps.current as any);

    if (isTopLevel) {
      addTopLevelNode(node, defaultState);
    } else {
      throw new Error('Child components are not supported yet.');
    }
  }, [addTopLevelNode, isTopLevel, node, stateFactoryProps]);

  useEffect(() => {
    setNodeProp(node, 'item', resolvedItem);
    node.updateCommonProps(resolvedItem as any);
  }, [node, resolvedItem, setNodeProp]);

  useEffect(() => {
    setNodeProp(node, 'hidden', hidden ?? false);
  }, [hidden, node, setNodeProp]);

  return <>{NodeGeneratorDebug && <pre style={{ fontSize: '0.8em' }}>{JSON.stringify(resolvedItem, null, 2)}</pre>}</>;
}

/**
 * Creates props for the expression resolver that can be used to evaluate expressions in a component configuration.
 * These props are passed on to your component's `evalExpressions` method.
 */
export function useExpressionResolverProps<T extends CompTypes>(
  node: LayoutNode<T>,
  item: CompExternalExact<T>,
): ExprResolver<T> {
  const allDataSources = useExpressionDataSources();
  const allDataSourcesAsRef = useAsRef(allDataSources);

  const evalProto = useCallback(
    <T extends ExprVal>(
      type: T,
      expr: ExprValToActualOrExpr<T> | undefined,
      defaultValue: ExprValToActual<T>,
      dataSources?: Partial<HierarchyDataSources>,
    ) => {
      const config: ExprConfig = {
        returnType: type,
        defaultValue,
      };

      return evalExpr(expr, node, { ...allDataSourcesAsRef.current, ...dataSources }, { config });
    },
    [allDataSourcesAsRef, node],
  );

  const evalBool = useCallback<SimpleEval<ExprVal.Boolean>>(
    (expr, defaultValue, dataSources) => evalProto(ExprVal.Boolean, expr, defaultValue, dataSources),
    [evalProto],
  );

  const evalStr = useCallback<SimpleEval<ExprVal.String>>(
    (expr, defaultValue, dataSources) => evalProto(ExprVal.String, expr, defaultValue, dataSources),
    [evalProto],
  );

  const evalNum = useCallback<SimpleEval<ExprVal.Number>>(
    (expr, defaultValue, dataSources) => evalProto(ExprVal.Number, expr, defaultValue, dataSources),
    [evalProto],
  );

  const evalAny = useCallback<SimpleEval<ExprVal.Any>>(
    (expr, defaultValue, dataSources) => evalProto(ExprVal.Any, expr, defaultValue, dataSources),
    [evalProto],
  );

  // This resolves common expressions that are used by multiple components
  // and are not specific to a single component type.
  const evalBase = useCallback<ExprResolver<T>['evalBase']>(() => {
    const { hidden: _hidden, ...rest } = item;
    return {
      ...rest,
      ...(rest.pageBreak
        ? {
            pageBreak: {
              breakBefore: evalStr(rest.pageBreak.breakBefore, 'auto'),
              breakAfter: evalStr(rest.pageBreak.breakAfter, 'auto'),
            },
          }
        : {}),
    };
  }, [evalStr, item]);

  const evalFormProps = useCallback<ExprResolver<T>['evalFormProps']>(() => {
    const out: any = {};
    if (isFormItem(item)) {
      if (item.required !== undefined) {
        out.required = evalBool(item.required, false);
      }
      if (item.readOnly !== undefined) {
        out.readOnly = evalBool(item.readOnly, false);
      }
    }

    return out;
  }, [evalBool, item]);

  const evalSummarizable = useCallback<ExprResolver<T>['evalSummarizable']>(() => {
    const out: any = {};
    if (isSummarizableItem(item) && item.renderAsSummary !== undefined) {
      out.renderAsSummary = evalBool(item.renderAsSummary, false);
    }

    return out;
  }, [evalBool, item]);

  // This resolves all text resource bindings in a component
  const evalTrb = useCallback<ExprResolver<T>['evalTrb']>(() => {
    const trb: Record<string, string> = {};
    if (item.textResourceBindings) {
      for (const [key, value] of Object.entries(item.textResourceBindings)) {
        trb[key] = evalStr(value, '');
      }
    }

    return {
      textResourceBindings: (item.textResourceBindings ? trb : undefined) as ExprResolved<ITextResourceBindings<T>>,
    };
  }, [evalStr, item]);

  return {
    item,
    evalBool,
    evalNum,
    evalStr,
    evalAny,
    evalBase,
    evalFormProps,
    evalSummarizable,
    evalTrb,
    formDataSelector: allDataSources.formDataSelector,
  };
}

function useItem<T extends CompTypes = CompTypes>(item: CompExternal<T>): CompExternal<T> {
  const directMutators = NodeGeneratorInternal.useDirectMutators();
  const recursiveMutators = NodeGeneratorInternal.useRecursiveMutators();

  return useMemo(() => {
    const newItem = structuredClone(item);
    for (const mutator of directMutators) {
      mutator(newItem);
    }
    for (const mutator of recursiveMutators) {
      mutator(newItem);
    }

    return newItem;
  }, [directMutators, item, recursiveMutators]);
}

function usePath<T extends CompTypes>(item: CompExternal<T>): string[] {
  const parent = NodeGeneratorInternal.useParent();

  return useMemo(() => {
    const parentPath = parent instanceof LayoutPage ? [parent.pageKey] : parent.path;
    return [...parentPath, item.id];
  }, [item.id, parent]);
}

/**
 * Creates a new node instance for a component item, and adds that to the parent node and the store.
 */
function useNewNode<T extends CompTypes>(item: CompExternal<T>, path: string[]): LayoutNode<T> {
  const page = NodeGeneratorInternal.usePage();
  const parent = NodeGeneratorInternal.useParent();
  const row = NodeGeneratorInternal.useRow();
  const store = NodesInternal.useDataStore();
  const LNode = useNodeConstructor(item.type);

  return useMemo(() => {
    const newNodeProps: LayoutNodeProps<T> = { item, parent, row, store, path };
    const node = new LNode(newNodeProps as any) as LayoutNode<T>;
    page._addChild(node);

    return node;
  }, [LNode, item, page, parent, path, row, store]);
}

function isFormItem(item: CompExternal): item is CompExternal & FormComponentProps {
  return 'readOnly' in item || 'required' in item || 'showValidations' in item;
}

function isSummarizableItem(item: CompExternal): item is CompExternal & SummarizableComponentProps {
  return 'renderAsSummary' in item;
}

function useDef<T extends CompTypes>(type: T) {
  const def = getLayoutComponentObject<T>(type)!;
  if (!def) {
    // TODO: Log error and produce an error node instead
    throw new Error(`Component type "${type}" not found`);
  }

  return def;
}

function useNodeConstructor<T extends CompTypes>(type: T) {
  const LNode = getNodeConstructor(type);
  if (!LNode) {
    // TODO: Log error and produce an error node instead
    throw new Error(`Component type "${type}" not found`);
  }

  return LNode;
}
