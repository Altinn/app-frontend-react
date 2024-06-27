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
 * not what you really want to use - this may make your component re-render often.
 *
 * Prefer to put expressions in your component configuration. There are two main ways:
 *
 * One-off expressions in each component:
 *  1. Add a property to the configuration using `new CG.expr(...)` in your `config.ts`. This does NOT automatically
 *     evaluate your expression, but it indicates to app developers that they can use expressions for this property.
 *  2. Set `functionality.customExpressions` to `true` in your `config.ts`
 *  3. Implement `evalExpressions()` in your `index.tsx` file. This function will be called by the hierarchy generator
 *     to evaluate the expressions in the configuration.
 *
 * Expressions that can be used in multiple components:
 *  1. Write a plugin that adds a property to the configuration using `new CG.expr(...)` and implements
 *     expression evaluation. See `AlertOnChangePlugin` for a simple example.
 *  2. Add the plugin to your component in `config.ts`.
 */
export function useEvalExpression<V extends ExprVal>(
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

    const identifier = node instanceof LayoutPage ? `page '${node.pageKey}'` : `component '${node.baseId}'`;
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