import {
  argTypeAt,
  layoutExpressionCastToType,
  layoutExpressionFunctions,
} from 'src/features/form/layout/expressions';
import { prettyErrors } from 'src/features/form/layout/expressions/prettyErrors';
import type {
  BaseValue,
  ILayoutExpression,
  ILayoutExpressionLookupFunctions,
  LayoutExpressionFunction,
} from 'src/features/form/layout/expressions/types';

enum ValidationErrorMessage {
  UnknownProperty = 'Unexpected property',
  InvalidType = 'Invalid type "%s"',
  FuncNotImpl = 'Function "%s" not implemented',
  ArgsNotArr = 'Arguments not an array',
  ArgUnexpected = 'Unexpected argument',
  ArgWrongType = 'Expected argument to be %s, got %s',
  ArgsWrongNum = 'Expected %s argument(s), got %s',
  FuncMissing = 'Missing "function" property',
}

interface ValidationContext {
  errors: {
    [key: string]: string[];
  };
}

const validLookupFunctions: {
  [funcName in keyof ILayoutExpressionLookupFunctions]: true;
} = {
  dataModel: true,
  applicationSettings: true,
  component: true,
  instanceContext: true,
};

const validBasicTypes: { [key: string]: BaseValue } = {
  boolean: 'boolean',
  string: 'string',
  bigint: 'number',
  number: 'number',
};

export class InvalidExpression extends Error {}

function addError(
  ctx: ValidationContext,
  path: string[],
  message: ValidationErrorMessage,
  ...params: string[]
) {
  let paramIdx = 0;
  const newMessage = message.replaceAll('%s', () => params[paramIdx++]);
  const stringPath = path.join('.');
  if (ctx.errors[stringPath]) {
    ctx.errors[stringPath].push(newMessage);
  } else {
    ctx.errors[stringPath] = [newMessage];
  }
}

function validateFunctionArgs(
  func: LayoutExpressionFunction,
  actual: (BaseValue | undefined)[],
  ctx: ValidationContext,
  path: string[],
) {
  const expected =
    func in validLookupFunctions
      ? ['string']
      : layoutExpressionFunctions[func].args;

  let minExpected = layoutExpressionFunctions[func]?.minArguments;
  if (minExpected === undefined) {
    minExpected = expected.length;
  }

  const canSpread =
    func in validLookupFunctions
      ? false
      : layoutExpressionFunctions[func].lastArgSpreads;

  const maxIdx = Math.max(expected.length, actual.length);
  for (let idx = 0; idx < maxIdx; idx++) {
    const expectedType = argTypeAt(func, idx);
    const actualType = actual[idx];
    if (expectedType === undefined) {
      addError(
        ctx,
        [...path, `args[${idx}]`],
        ValidationErrorMessage.ArgUnexpected,
      );
    } else {
      const targetType = layoutExpressionCastToType[expectedType];

      if (actualType === undefined) {
        if (targetType.nullable) {
          continue;
        }
        addError(
          ctx,
          [...path, `args[${idx}]`],
          ValidationErrorMessage.ArgWrongType,
          expectedType,
          'null',
        );
      }

      if (!targetType.accepts.includes(actualType)) {
        addError(
          ctx,
          [...path, `args[${idx}]`],
          ValidationErrorMessage.ArgWrongType,
          expectedType,
          'null',
        );
      }
    }
  }

  if (canSpread && actual.length >= minExpected) {
    return;
  }

  if (actual.length !== minExpected) {
    addError(
      ctx,
      [...path, `args`],
      ValidationErrorMessage.ArgsWrongNum,
      `${minExpected}${canSpread ? '+' : ''}`,
      `${actual.length}`,
    );
  }
}

function validateFunction(
  funcName: any,
  argTypes: (BaseValue | undefined)[],
  ctx: ValidationContext,
  path: string[],
): BaseValue | undefined {
  if (typeof funcName !== 'string') {
    addError(ctx, path, ValidationErrorMessage.InvalidType, typeof funcName);
    return;
  }

  const pathArgs = [...path.slice(0, path.length - 1)];

  if (
    funcName in validLookupFunctions ||
    funcName in layoutExpressionFunctions
  ) {
    validateFunctionArgs(
      funcName as LayoutExpressionFunction,
      argTypes,
      ctx,
      pathArgs,
    );
    if (funcName in validLookupFunctions) {
      return 'string';
    }
    return layoutExpressionFunctions[
      funcName as keyof typeof layoutExpressionFunctions
    ].returns;
  }

  addError(ctx, path, ValidationErrorMessage.FuncNotImpl, funcName);
}

function validateArgument(
  expr: any,
  ctx: ValidationContext,
  path: string[],
): BaseValue | undefined {
  const type = typeof expr;
  if (validBasicTypes[type]) {
    return validBasicTypes[type];
  }
  if (typeof expr === 'undefined' || expr === null) {
    return;
  }

  if (typeof expr === 'object') {
    return validateRecursively(expr, ctx, path);
  }

  addError(ctx, path, ValidationErrorMessage.InvalidType, type);
}

function validateRecursively(
  expr: any,
  ctx: ValidationContext,
  path: string[],
): BaseValue | undefined {
  if (validBasicTypes[typeof expr]) {
    return validBasicTypes[typeof expr];
  }

  if (typeof expr === 'undefined' || expr === null) {
    return;
  }

  if (typeof expr === 'object') {
    const args: (BaseValue | undefined)[] = [];
    let returnVal: BaseValue | undefined;
    if ('args' in expr) {
      if (Array.isArray(expr.args)) {
        for (const argIdx in expr.args) {
          args.push(
            validateArgument(expr.args[argIdx], ctx, [
              ...path,
              `args[${argIdx}]`,
            ]),
          );
        }
      } else {
        addError(ctx, [...path, 'args'], ValidationErrorMessage.ArgsNotArr);
      }
    } else {
      addError(ctx, path, ValidationErrorMessage.ArgsNotArr);
    }

    if ('function' in expr) {
      returnVal = validateFunction(expr.function, args, ctx, [
        ...path,
        'function',
      ]);
    } else {
      addError(ctx, path, ValidationErrorMessage.FuncMissing);
    }

    const otherKeys = Object.keys(expr).filter(
      (key) => key !== 'function' && key !== 'args',
    );
    for (const otherKey of otherKeys) {
      addError(
        ctx,
        [...path, otherKey],
        ValidationErrorMessage.UnknownProperty,
      );
    }

    return returnVal;
  }

  addError(ctx, path, ValidationErrorMessage.InvalidType, typeof expr);
}

function validate(expr: any) {
  const ctx: ValidationContext = {
    errors: {},
  };

  validateRecursively(expr, ctx, []);

  if (Object.keys(ctx.errors).length) {
    throw new InvalidExpression(
      `Invalid layout expression:\n${prettyErrors({
        input: expr,
        errors: ctx.errors,
        indentation: 1,
      })}`,
    );
  }

  return expr;
}

/**
 * Takes the input object, validates it to make sure it is a valid layout expression, returns either a fully
 * parsed verbose expression (ready to pass to evalExpr()), or undefined (if not a valid expression).
 *
 * @param obj Input, can be anything
 */
export function asLayoutExpression(obj: any): ILayoutExpression | undefined {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    'function' in obj &&
    'args' in obj
  ) {
    return validate(obj);
  }
}
