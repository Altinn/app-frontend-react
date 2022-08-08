import { parseDsl } from 'src/features/form/layout/expressions/dsl';
import { layoutExpressionFunctions } from 'src/features/form/layout/expressions/functions';
import type {
  ILayoutExpressionArg,
  ILayoutExpressionRunnerLookups,
  ILayoutExpressionStructured,
} from 'src/features/form/layout/expressions/types';

/**
 * Run/evaluate a layout expression. You have to provide your own functions for looking up external values. If you
 * need a more concrete implementation:
 * @see useLayoutExpression
 */
export function evalExpr(
  expr: ILayoutExpressionStructured,
  lookups: ILayoutExpressionRunnerLookups,
): boolean {
  const computedArgs = expr.args.map((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      const [key] = Object.keys(arg);
      return lookups[key](arg[key]);
    }
    return arg;
  });

  const result = layoutExpressionFunctions[expr.function].apply(
    null,
    computedArgs,
  );

  if (typeof expr.mapping === 'object') {
    const resultType = typeof result;
    const jsonTypes: typeof resultType[] = [
      'boolean',
      'number',
      'undefined',
      'object',
    ];

    const lookupInMapping = jsonTypes.includes(resultType)
      ? JSON.stringify(result)
      : result;

    const lookupResult = expr.mapping[lookupInMapping];
    if (typeof lookupResult !== 'undefined') {
      return lookupResult;
    }

    if ('__default__' in expr.mapping) {
      return expr.mapping['__default__'];
    }

    // Fall through and return the actual result
  }

  return result;
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

function asValidDsl(
  obj: any,
  debug: boolean,
): ILayoutExpressionStructured | undefined {
  if ('mapping' in obj && Object.keys(obj).length !== 2) {
    _debug(ValidationError.PropCount, obj, debug);
    return;
  }
  if (!('mapping' in obj) && Object.keys(obj).length !== 1) {
    _debug(ValidationError.PropCount, obj, debug);
    return;
  }

  const expr = parseDsl(obj.expr, debug);
  if ('mapping' in obj) {
    expr.mapping = obj.mapping;
  }

  return expr;
}

function asValidStructured(
  obj: any,
  debug: boolean,
): ILayoutExpressionStructured | undefined {
  if ('mapping' in obj && Object.keys(obj).length !== 3) {
    _debug(ValidationError.PropCount, obj, debug);
    return;
  }
  if (!('mapping' in obj) && Object.keys(obj).length !== 2) {
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

  return obj as ILayoutExpressionStructured;
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
): ILayoutExpressionStructured | undefined {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  if ('expr' in obj) {
    return asValidDsl(obj, debug);
  }

  if ('function' in obj && 'args' in obj) {
    return asValidStructured(obj, debug);
  }
}
