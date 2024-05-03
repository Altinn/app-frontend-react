import React, { useCallback, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { useAsRef } from 'src/hooks/useAsRef';
import { getComponentDef, getNodeConstructor } from 'src/layout';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import { NodeGeneratorDebug } from 'src/utils/layout/NodesGenerator';
import { NodeGeneratorInternal, NodesGeneratorProvider } from 'src/utils/layout/NodesGeneratorContext';
import { NodeStages } from 'src/utils/layout/NodeStages';
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
import type { HiddenStateNode } from 'src/utils/layout/NodesContext';

/**
 * A node generator will always be rendered when a component is present in a layout, even if the component
 * normally is hidden, the user is on another page, or the component is not visible for some other reason.
 *
 * Its job is to use relevant data sources to evaluate expressions in the item/component configuration,
 * and update other states needed by the component to function. We do this so that the node hierarchy
 * can always be up-to-date, and so that we can implement effects for components that run even when the
 * component is not visible/rendered.
 */
export function NodeGenerator({ children, baseId }: PropsWithChildren<BasicNodeGeneratorProps>) {
  const layoutMap = NodeGeneratorInternal.useLayoutMap();
  const item = useItem(layoutMap[baseId]);
  const path = usePath(item);
  const node = useNewNode(item, path) as LayoutNode;
  useAddRemoveNode(node, item);

  const hiddenParent = NodeGeneratorInternal.useHiddenState();
  const hiddenByExpression = useResolvedExpression(ExprVal.Boolean, node, item.hidden, false);
  const hiddenByRules = Hidden.useIsHiddenViaRules(node);
  const hidden: HiddenStateNode = useMemo(
    () => ({
      parent: hiddenParent,
      hiddenByExpression,
      hiddenByRules,
      hiddenByTracks: false,
    }),
    [hiddenByExpression, hiddenByRules, hiddenParent],
  );

  const resolvedItem = useResolvedItem({ node, hidden, item });

  return (
    <>
      {NodeGeneratorDebug && <pre style={{ fontSize: '0.8em' }}>{JSON.stringify(resolvedItem, null, 2)}</pre>}
      <NodesGeneratorProvider
        parent={node}
        hidden={hidden}
        item={resolvedItem}
      >
        {children}
      </NodesGeneratorProvider>
    </>
  );
}

function useAddRemoveNode(node: LayoutNode, item: CompExternal) {
  const parent = NodeGeneratorInternal.useParent();
  const row = NodeGeneratorInternal.useRow();
  const stateFactoryPropsRef = useAsRef<StateFactoryProps<any>>({ item, parent, row });
  const addNode = NodesInternal.useAddNode();
  const isParentAdded = NodesInternal.useIsAdded(parent);

  const page = NodeGeneratorInternal.usePage();
  const removeNode = NodesInternal.useRemoveNode();
  const nodeRef = useAsRef(node);
  const pageRef = useAsRef(page);

  NodeStages.AddNodes.useEffect(() => {
    if (isParentAdded) {
      const defaultState = nodeRef.current.def.stateFactory(stateFactoryPropsRef.current as any);
      addNode(nodeRef.current, defaultState);
    }
  }, [addNode, isParentAdded, nodeRef, stateFactoryPropsRef]);

  NodeStages.AddNodes.useEffect(
    () => () => {
      pageRef.current._removeChild(nodeRef.current);
      removeNode(nodeRef.current);
    },
    [nodeRef, pageRef, removeNode],
  );
}

interface NodeResolverProps<T extends CompTypes> {
  node: LayoutNode<T>;
  hidden: HiddenStateNode;
  item: CompExternal<T>;
}

function useResolvedItem<T extends CompTypes = CompTypes>({
  node,
  hidden,
  item,
}: NodeResolverProps<T>): CompInternal<T> | undefined {
  const resolverProps = useExpressionResolverProps(node, item);
  const allNodesAdded = NodeStages.AddNodes.useIsDone();

  const def = useDef(item.type);
  const setNodeProp = NodesInternal.useSetNodeProp();
  const resolvedItem = useMemo(
    () => (allNodesAdded ? ((def as CompDef<T>).evalExpressions(resolverProps as any) as CompInternal<T>) : undefined),
    [def, resolverProps, allNodesAdded],
  );

  NodeStages.MarkHidden.useEffect(() => {
    setNodeProp(node, 'hidden', hidden);
  }, [hidden, node, setNodeProp]);

  NodeStages.EvaluateExpressions.useEffect(() => {
    setNodeProp(node, 'item', resolvedItem);
    node.updateCommonProps(resolvedItem as any);
  }, [node, resolvedItem, setNodeProp]);

  return resolvedItem;
}

/**
 * Creates props for the expression resolver that can be used to evaluate expressions in a component configuration.
 * These props are passed on to your component's `evalExpressions` method.
 */
export function useExpressionResolverProps<T extends CompTypes>(
  node: LayoutNode<T>,
  item: CompExternalExact<T>,
): ExprResolver<T> {
  const stateSelector = NodesInternal.useExactNodeStateMemoSelector(node);
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
    stateSelector,
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
  const def = getComponentDef<T>(type)!;
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
