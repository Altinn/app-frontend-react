import { useMemo } from 'react';

import { evalExpr } from 'src/features/expressions';
import { ExprValidation } from 'src/features/expressions/validation';
import { GeneratorStages } from 'src/utils/layout/generator/GeneratorStages';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { ExprConfig, ExprVal, ExprValToActual, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

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
  const allNodesAdded = GeneratorStages.AddNodes.useIsDone();

  return useMemo(() => {
    if (!allNodesAdded) {
      return defaultValue;
    }

    const identifier = node instanceof LayoutPage ? `page '${node.pageKey}'` : `component '${node.getBaseId()}'`;
    const errorIntroText = `Invalid expression for ${identifier}`;
    if (!ExprValidation.isValidOrScalar(expr, type, errorIntroText)) {
      return defaultValue;
    }

    const config: ExprConfig = {
      returnType: type,
      defaultValue,
    };

    return evalExpr(expr, node, allDataSources, { config, errorIntroText });
  }, [allNodesAdded, allDataSources, defaultValue, expr, node, type]);
}
