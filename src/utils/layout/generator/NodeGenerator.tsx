import React, { useCallback, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { useAsRef } from 'src/hooks/useAsRef';
import { getComponentDef, getNodeConstructor } from 'src/layout';
import { GeneratorDebug } from 'src/utils/layout/generator/debug';
import { GeneratorInternal, GeneratorProvider } from 'src/utils/layout/generator/GeneratorContext';
import { useGeneratorErrorBoundaryNodeRef } from 'src/utils/layout/generator/GeneratorErrorBoundary';
import { GeneratorStages } from 'src/utils/layout/generator/GeneratorStages';
import { useResolvedExpression } from 'src/utils/layout/generator/useResolvedExpression';
import { NodeValidation } from 'src/utils/layout/generator/validation/NodeValidation';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import type { SimpleEval } from 'src/features/expressions';
import type { ExpressionDataSources } from 'src/features/expressions/ExprContext';
import type { ExprConfig, ExprResolved, ExprValToActual, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { CompDef } from 'src/layout';
import type { FormComponentProps, SummarizableComponentProps } from 'src/layout/common.generated';
import type {
  CompExternal,
  CompIntermediate,
  CompIntermediateExact,
  CompInternal,
  CompTypes,
  ITextResourceBindings,
} from 'src/layout/layout';
import type { BasicNodeGeneratorProps, ExprResolver } from 'src/layout/LayoutComponent';
import type { LayoutNode, LayoutNodeProps } from 'src/utils/layout/LayoutNode';
import type { HiddenStateNode } from 'src/utils/layout/NodesContext';
import type { BaseRow, StateFactoryProps } from 'src/utils/layout/types';

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
  const layoutMap = GeneratorInternal.useLayoutMap();
  const item = useIntermediateItem(layoutMap[baseId]) as CompIntermediateExact<CompTypes>;
  const path = usePath(item);
  const node = useNewNode(item, path) as LayoutNode;
  useGeneratorErrorBoundaryNodeRef().current = node;

  return (
    <>
      <MarkAsHidden
        node={node}
        item={item}
        baseId={baseId}
      />
      <AddRemoveNode
        node={node}
        item={item}
      />
      <GeneratorProvider
        parent={node}
        item={item}
      >
        <ResolveExpressions
          node={node}
          item={item}
        />
        <NodeValidation
          node={node}
          item={item}
        />
        {children}
      </GeneratorProvider>
    </>
  );
}

interface CommonProps<T extends CompTypes> {
  node: LayoutNode<T>;
  item: CompIntermediateExact<T>;
}

function MarkAsHidden<T extends CompTypes>({ node, baseId }: CommonProps<T> & { baseId: string }) {
  const layoutMap = GeneratorInternal.useLayoutMap();
  const allNodesAdded = GeneratorStages.AddNodes.useIsDone();
  const isAdded = NodesInternal.useIsAdded(node);
  const ready = isAdded && allNodesAdded;
  const setNodeProp = NodesInternal.useSetNodeProp();

  const hiddenByExpression = useResolvedExpression(ExprVal.Boolean, node, layoutMap[baseId].hidden, false);
  const hiddenByRules = Hidden.useIsHiddenViaRules(node);
  const hidden = useMemo(
    () =>
      ({
        hiddenByExpression,
        hiddenByRules,
        hiddenByTracks: false,
      }) satisfies HiddenStateNode,
    [hiddenByExpression, hiddenByRules],
  );

  GeneratorStages.MarkHidden.useConditionalEffect(() => {
    if (ready) {
      setNodeProp(node, 'hidden', hidden);
      return true;
    }
    return false;
  }, [hidden, node, setNodeProp, ready]);

  return null;
}

function AddRemoveNode<T extends CompTypes>({ node, item }: CommonProps<T>) {
  const parent = GeneratorInternal.useParent();
  const row = GeneratorInternal.useRow();
  const rowRef = useAsRef(row);
  const stateFactoryPropsRef = useAsRef<StateFactoryProps<any>>({ item, parent, row });
  const addNode = NodesInternal.useAddNode();
  const isParentAdded = NodesInternal.useIsAdded(parent);

  const page = GeneratorInternal.usePage();
  const removeNode = NodesInternal.useRemoveNode();
  const nodeRef = useAsRef(node);
  const pageRef = useAsRef(page);

  GeneratorStages.AddNodes.useConditionalEffect(() => {
    if (isParentAdded) {
      const defaultState = nodeRef.current.def.stateFactory(stateFactoryPropsRef.current as any);
      addNode(nodeRef.current, defaultState, row);
      return true;
    }
    return false;
  }, [addNode, isParentAdded, nodeRef, stateFactoryPropsRef, row]);

  GeneratorStages.AddNodes.useEffect(
    () => () => {
      pageRef.current._removeChild(nodeRef.current);
      removeNode(nodeRef.current, rowRef.current);
    },
    [nodeRef, pageRef, removeNode, rowRef],
  );

  return null;
}

function ResolveExpressions<T extends CompTypes>({ node, item }: CommonProps<T>) {
  const resolverProps = useExpressionResolverProps(node, item);
  const allNodesAdded = GeneratorStages.AddNodes.useIsDone();
  const isAdded = NodesInternal.useIsAdded(node);
  const ready = isAdded && allNodesAdded;

  const def = useDef(item.type);
  const setNodeProp = NodesInternal.useSetNodeProp();
  const resolved = useMemo(
    () => (ready ? ((def as CompDef<T>).evalExpressions(resolverProps as any) as CompInternal<T>) : undefined),
    [ready, def, resolverProps],
  );

  GeneratorStages.EvaluateExpressions.useConditionalEffect(() => {
    if (ready && resolved !== undefined) {
      node.updateCommonProps(resolved as any);
      setNodeProp(node, 'item', resolved);
      return true;
    }
    return false;
  }, [node, resolved, setNodeProp, ready]);

  return (
    <>{GeneratorDebug.displayState && <pre style={{ fontSize: '0.8em' }}>{JSON.stringify(resolved, null, 2)}</pre>}</>
  );
}

/**
 * Creates props for the expression resolver that can be used to evaluate expressions in a component configuration.
 * These props are passed on to your component's `evalExpressions` method.
 */
export function useExpressionResolverProps<T extends CompTypes>(
  node: LayoutNode<T> | undefined,
  item: CompIntermediateExact<T>,
  row?: BaseRow,
): ExprResolver<T> {
  const stateSelector = NodesInternal.useExactNodeDataMemoSelector(node);
  const allDataSources = useExpressionDataSources();
  const allDataSourcesAsRef = useAsRef(allDataSources);

  const evalProto = useCallback(
    <T extends ExprVal>(
      type: T,
      expr: ExprValToActualOrExpr<T> | undefined,
      defaultValue: ExprValToActual<T>,
      dataSources?: Partial<ExpressionDataSources>,
    ) => {
      if (!node) {
        return defaultValue;
      }

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
    row,
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

function useIntermediateItem<T extends CompTypes = CompTypes>(item: CompExternal<T>): CompIntermediate<T> {
  const directMutators = GeneratorInternal.useDirectMutators();
  const recursiveMutators = GeneratorInternal.useRecursiveMutators();

  return useMemo(() => {
    const newItem = structuredClone(item) as CompIntermediate<T>;

    // The hidden property is handled elsewhere, and should never be passed to the item (and resolved as an
    // expression) which could be read. Try useIsHidden() or useIsHiddenSelector() if you need to know if a
    // component is hidden.
    delete newItem['hidden'];

    for (const mutator of directMutators) {
      mutator(newItem);
    }
    for (const mutator of recursiveMutators) {
      mutator(newItem);
    }

    return newItem;
  }, [directMutators, item, recursiveMutators]);
}

function usePath<T extends CompTypes>(item: CompIntermediate<T>): string[] {
  const parent = GeneratorInternal.useParent();

  return useMemo(() => {
    const parentPath = parent instanceof LayoutPage ? [parent.pageKey] : parent.path;
    return [...parentPath, item.id];
  }, [item.id, parent]);
}

/**
 * Creates a new node instance for a component item, and adds that to the parent node and the store.
 */
function useNewNode<T extends CompTypes>(item: CompIntermediate<T>, path: string[]): LayoutNode<T> {
  const page = GeneratorInternal.usePage();
  const parent = GeneratorInternal.useParent();
  const row = GeneratorInternal.useRow();
  const store = NodesInternal.useDataStore();
  const LNode = useNodeConstructor(item.type);

  return useMemo(() => {
    const newNodeProps: LayoutNodeProps<T> = { item, parent, row, store, path };
    const node = new LNode(newNodeProps as any) as LayoutNode<T>;
    page._addChild(node);

    return node;
  }, [LNode, item, page, parent, path, row, store]);
}

function isFormItem(item: CompIntermediate): item is CompIntermediate & FormComponentProps {
  return 'readOnly' in item || 'required' in item || 'showValidations' in item;
}

function isSummarizableItem(item: CompIntermediate): item is CompIntermediate & SummarizableComponentProps {
  return 'renderAsSummary' in item;
}

export function useDef<T extends CompTypes>(type: T) {
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
