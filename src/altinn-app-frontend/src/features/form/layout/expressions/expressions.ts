import { layoutExpressionFunctions } from 'src/features/form/layout/expressions/functions';
import type {
  ILayoutExpression,
  ILayoutExpressionRunnerLookups,
} from 'src/features/form/layout/expressions/types';

/**
 * Run/evaluate a layout expression. You have to provide your own functions for looking up external values. If you
 * need a more concrete implementation:
 * @see useLayoutExpression
 */
export function evalExpr(
  expr: ILayoutExpression,
  lookups: ILayoutExpressionRunnerLookups,
): boolean {
  const computedArgs = expr.args.map((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      const [key] = Object.keys(arg);
      return lookups[key](arg[key]);
    }
    return arg;
  });

  return layoutExpressionFunctions[expr.function].apply(lookups, computedArgs);
}
