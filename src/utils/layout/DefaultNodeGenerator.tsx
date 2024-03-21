import React, { useCallback, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { useAsRef } from 'src/hooks/useAsRef';
import { getNodeConstructor } from 'src/layout';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import type { SimpleEval } from 'src/features/expressions';
import type { ExprConfig, ExprValToActual, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { CompExternalExact, CompTypes, HierarchyDataSources } from 'src/layout/layout';
import type { BasicNodeGeneratorProps, ExprResolver } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

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

function useNewNode<T extends CompTypes>({ item, parent, row }: BasicNodeGeneratorProps<T>): LayoutNode<T> {
  return useMemo(() => {
    const LNode = getNodeConstructor(item.type);
    if (!LNode) {
      // TODO: Log error and produce an error node instead
      throw new Error(`Component type "${item.type}" not found`);
    }

    return new LNode(item as any, parent, row) as LayoutNode<T>;
  }, [item, parent, row]);
}
