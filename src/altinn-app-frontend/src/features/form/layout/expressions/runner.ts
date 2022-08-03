import { layoutExpressionFunctions } from 'src/features/form/layout/expressions/functions';
import type {
  ILayoutExpressionRunnerLookups,
  ILayoutExpressionStructured,
} from 'src/features/form/layout/expressions/types';

export function runExpr(
  expr: ILayoutExpressionStructured,
  deps: ILayoutExpressionRunnerLookups,
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
