import { layoutExpressionFunctions } from 'src/features/form/layout/expressions/functions';
import type {
  ILayoutExpression,
  ILayoutExpressionRunnerDependencies,
} from 'src/features/form/layout/expressions/types';

export function runExpr(
  expr: ILayoutExpression,
  deps: ILayoutExpressionRunnerDependencies,
): boolean {
  const computedArgs = expr.args.map((arg) => {
    if (typeof arg === 'object') {
      const [key] = Object.keys(arg);
      return deps[key](arg[key]);
    }
    return arg;
  });

  return layoutExpressionFunctions[expr.function].apply(null, computedArgs);
}
