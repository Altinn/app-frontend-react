import { layoutExpressionFunctions } from 'src/features/form/layout/expressions/functions';
import type {
  ILayoutExpression,
  ILayoutExpressionArg,
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

  return layoutExpressionFunctions[expr.function].apply(null, computedArgs);
}

enum ValidationError {
  PropCount = 'Failed to validate layout expression, unexpected property count:',
  FuncType = 'Failed to validate layout expression, invalid function type:',
  FuncNotImpl = 'Failed to validate layout expression, function is not implemented:',
  ArgsNotArr = 'Failed to validate layout expression, arguments not an array:',
  ArgsWrongNum = 'Failed to validate layout expression, wrong number of arguments:',
  LookupArgNotString = 'Failed to validate layout expression, argument to lookup function is not a string',
}

function _debug(error: ValidationError, obj: any, debug: boolean) {
  debug && console.error(error, obj);
}

function validateArgument(
  obj: any,
  debug: boolean,
): obj is ILayoutExpressionArg {
  const type = typeof obj;
  const validBasicTypes: typeof type[] = [
    'boolean',
    'string',
    'undefined',
    'bigint',
    'number',
  ];
  if (validBasicTypes.includes(type)) {
    return true;
  }
  if (obj === null) {
    return true;
  }

  if (type === 'object' && Object.keys(obj).length === 1) {
    const validKeys = [
      'dataModel',
      'component',
      'instanceContext',
      'applicationSettings',
    ];
    for (const key of validKeys) {
      if (key in obj) {
        if (typeof obj[key] === 'string') {
          return true;
        } else {
          _debug(ValidationError.LookupArgNotString, obj, debug);
          return false;
        }
      }
    }
  }

  return false;
}

function asValidStructured(
  obj: any,
  debug: boolean,
): ILayoutExpression | undefined {
  if (Object.keys(obj).length !== 2) {
    _debug(ValidationError.PropCount, obj, debug);
    return;
  }
  if (typeof obj.function !== 'string') {
    _debug(ValidationError.FuncType, obj, debug);
    return;
  }
  if (!layoutExpressionFunctions[obj.function]) {
    _debug(ValidationError.FuncNotImpl, obj, debug);
    return;
  }
  if (!Array.isArray(obj.args)) {
    _debug(ValidationError.ArgsNotArr, obj, debug);
    return;
  }

  const expectedArguments = obj.function === 'lookup' ? 1 : 2;
  if (obj.args.length !== expectedArguments) {
    _debug(ValidationError.ArgsWrongNum, obj, debug);
    return;
  }

  const allArgumentsValid = (obj.args as Array<any>)
    .map((arg) => validateArgument(arg, debug))
    .reduce((prev, current) => prev && current, true);

  if (!allArgumentsValid) {
    return;
  }

  return obj as ILayoutExpression;
}

/**
 * Takes the input object, validates it to make sure it is a valid layout expression, returns either a fully
 * parsed structured expression (ready to pass to evalExpr()), or undefined (if not a valid expression).
 *
 * @param obj Input, can be anything
 * @param debug If set to true (default) this will log an error message to the console if we found something that
 *  kind-of looks like a layout expression, but failed to validate as a proper expression. This will inform application
 *  developers of common mistakes.
 */
export function asLayoutExpression(
  obj: any,
  debug = true,
): ILayoutExpression | undefined {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  if ('function' in obj && 'args' in obj) {
    return asValidStructured(obj, debug);
  }
}
