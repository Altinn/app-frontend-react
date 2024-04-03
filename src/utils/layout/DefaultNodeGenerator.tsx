import React, { useCallback, useEffect, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { useStore } from 'zustand';

import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { useAsRef } from 'src/hooks/useAsRef';
import { getLayoutComponentObject, getNodeConstructor } from 'src/layout';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { NodesInternal } from 'src/utils/layout/NodesContext';
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
import type { BasicNodeGeneratorProps, ExprResolver, StateFactoryProps } from 'src/layout/LayoutComponent';
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
export function DefaultNodeGenerator<T extends CompTypes>({
  children,
  ...props
}: PropsWithChildren<BasicNodeGeneratorProps<T>>) {
  const node = useNewNode(props);
  const page = props.parent instanceof LayoutPage ? props.parent : props.parent.page;
  const isTopLevel = props.parent === page;
  const isTopLevelRef = useAsRef(isTopLevel);
  const removeTopLevelNode = NodesInternal.useRemoveTopLevelNode();
  const nodeRef = useAsRef(node);
  const pageRef = useAsRef(page);

  useRegisterNode(node, isTopLevel, props);

  const resolverProps = useExpressionResolverProps(node, props.item);
  const resolvedItem = useResolvedItem(node, props.item, resolverProps);

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
      {props.debug && <pre style={{ fontSize: '0.8em' }}>{JSON.stringify(resolvedItem, null, 2)}</pre>}
      {children}
    </>
  );
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
  const evalCommon = useCallback<ExprResolver<T>['evalCommon']>(() => {
    const extras: any = {};
    if (isFormItem(item)) {
      if (item.required !== undefined) {
        extras.required = evalBool(item.required, false);
      }
      if (item.readOnly !== undefined) {
        extras.readOnly = evalBool(item.readOnly, false);
      }
    }
    if (isSummarizableItem(item) && item.renderAsSummary !== undefined) {
      extras.renderAsSummary = evalBool(item.renderAsSummary, false);
    }

    return {
      ...item,
      hidden: evalBool(item.hidden, false),
      ...extras,
    };
  }, [evalBool, item]);

  // This resolves all text resource bindings in a component
  const evalTrb = useCallback<ExprResolver<T>['evalTrb']>(() => {
    const trb: Record<string, string> = {};
    if (item.textResourceBindings) {
      for (const [key, value] of Object.entries(item.textResourceBindings)) {
        trb[key] = evalStr(value, '');
      }
    }

    return { textResourceBindings: trb as ExprResolved<ITextResourceBindings<T>> };
  }, [evalStr, item]);

  return {
    item,
    evalBool,
    evalNum,
    evalStr,
    evalAny,
    evalCommon,
    evalTrb,
    formDataSelector: allDataSources.formDataSelector,
  };
}

/**
 * Creates a new node instance for a component item, and adds that to the parent node and the store.
 */
function useNewNode<T extends CompTypes>({ item, parent, row, path }: BasicNodeGeneratorProps<T>): LayoutNode<T> {
  const page = parent instanceof LayoutPage ? parent : parent.page;
  const store = NodesInternal.useDataStore();
  const LNode = useNodeConstructor(item.type);

  return useMemo(() => {
    const newNodeProps: LayoutNodeProps<T> = { item, parent, row, store, path };
    const node = new LNode(newNodeProps as any) as LayoutNode<T>;
    page._addChild(node);

    return node;
  }, [LNode, item, page, parent, path, row, store]);
}

function useRegisterNode<T extends CompTypes>(
  node: LayoutNode<T>,
  isTopLevel: boolean,
  props: BasicNodeGeneratorProps<T>,
) {
  const { item, row, parent } = props;
  const addTopLevelNode = NodesInternal.useAddTopLevelNode();
  const def = node.def;
  useEffect(() => {
    const stateFactoryProps: StateFactoryProps<T> = { item: item as any, parent, row };
    const defaultState = def.stateFactory(stateFactoryProps as any);

    if (isTopLevel) {
      addTopLevelNode(node, defaultState);
    } else {
      throw new Error('Child components are not supported yet.');
    }
  }, [addTopLevelNode, def, isTopLevel, item, node, parent, row]);
}

/**
 * Takes the resolver props and the item configuration, and resolves the item configuration into a CompInternal<Type>
 * object, which is then set on the node.
 */
function useResolvedItem<T extends CompTypes>(
  node: LayoutNode<T>,
  item: CompExternalExact<T>,
  resolverProps: ExprResolver<T>,
): CompInternal<T> {
  const def = useDef(item.type);
  const setNodeProp = useStore(node.store, (state) => state.setNodeProp);
  const resolvedItem = useMemo(
    () => (def as CompDef<T>).evalExpressions(resolverProps as any) as CompInternal<T>,
    [def, resolverProps],
  );

  useEffect(() => {
    setNodeProp(node, 'item', resolvedItem);
    node.updateCommonProps(resolvedItem as any);
  }, [node, resolvedItem, setNodeProp]);

  return resolvedItem;
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
