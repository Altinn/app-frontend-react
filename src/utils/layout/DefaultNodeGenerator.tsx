import React, { useCallback, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { useAsRef } from 'src/hooks/useAsRef';
import { getLayoutComponentObject, getNodeConstructor } from 'src/layout';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import type { SimpleEval } from 'src/features/expressions';
import type { ExprConfig, ExprResolved, ExprValToActual, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { CompDef } from 'src/layout';
import type { FormComponentProps, SummarizableComponentProps } from 'src/layout/common.generated';
import type {
  CompExternal,
  CompExternalExact,
  CompTypes,
  HierarchyDataSources,
  ITextResourceBindings,
} from 'src/layout/layout';
import type { BasicNodeGeneratorProps, ExprResolver, StoreFactoryProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ItemStore } from 'src/utils/layout/types';

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
  const store = useNodeStore(props);
  const node = useNewNode(store, props);
  const resolverProps = useExpressionResolverProps(node, props.item);

  return <>{children}</>;
}

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

function useNodeStore<T extends CompTypes>({ item, parent, row }: BasicNodeGeneratorProps<T>): ItemStore<T> {
  return useMemo(() => {
    const def = getLayoutComponentObject(item.type);
    if (!def) {
      // TODO: Log error and produce an error node instead
      throw new Error(`Component type "${item.type}" not found`);
    }

    const props = { item, parent, row } as StoreFactoryProps<T>;
    return (def as CompDef<T>).storeFactory(props as any) as ItemStore<T>;
  }, [item, parent, row]);
}

function useNewNode<T extends CompTypes>(
  store: ItemStore<T>,
  { item, parent, row }: BasicNodeGeneratorProps<T>,
): LayoutNode<T> {
  return useMemo(() => {
    const LNode = getNodeConstructor(item.type);
    if (!LNode) {
      // TODO: Log error and produce an error node instead
      throw new Error(`Component type "${item.type}" not found`);
    }

    return new LNode(store as any, parent, row) as LayoutNode<T>;
  }, [store, item.type, parent, row]);
}

function isFormItem(item: CompExternal): item is CompExternal & FormComponentProps {
  return 'readOnly' in item || 'required' in item || 'showValidations' in item;
}

function isSummarizableItem(item: CompExternal): item is CompExternal & SummarizableComponentProps {
  return 'renderAsSummary' in item;
}
