import { useMemo } from 'react';

import { evalExpr } from 'src/features/expressions';
import { useAsRef } from 'src/hooks/useAsRef';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import { NodeStages } from 'src/utils/layout/NodeStages';
import type { ExprConfig, ExprVal, ExprValToActual, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

/**
 * Resolves one expression and returns the result. This is a hook version of the evalExpr function, and it's probably
 * not what you really want to use - this may make your component re-render often. Prefer to use other alternatives,
 * such as:
 * @see useNodeItem
 */
export function useResolvedExpression<V extends ExprVal>(
  type: V,
  node: LayoutNode | LayoutPage,
  expr: ExprValToActualOrExpr<V> | undefined,
  defaultValue: ExprValToActual<V>,
) {
  const allDataSources = useExpressionDataSources();
  const dataSourcesAsRef = useAsRef(allDataSources);
  const allNodesAdded = NodeStages.S1AddNodes.useIsDone();

  return useMemo(() => {
    if (!allNodesAdded) {
      return defaultValue;
    }

    const config: ExprConfig = {
      returnType: type,
      defaultValue,
    };

    return evalExpr(expr, node, dataSourcesAsRef.current, { config });
  }, [allNodesAdded, dataSourcesAsRef, defaultValue, expr, node, type]);
}
