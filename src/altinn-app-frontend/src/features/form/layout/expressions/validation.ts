import { layoutExpressionFunctions } from 'src/features/form/layout/expressions';
import type {
  BaseValue,
  ILayoutExpression,
  ILayoutExpressionLookupFunctions,
} from 'src/features/form/layout/expressions/types';

enum ValidationErrorMessage {
  UnknownProperty = 'Unexpected property',
  InvalidType = 'Invalid type "%s"',
  FuncNotImpl = 'Function "%s" not implemented',
  ArgsNotArr = 'Arguments not an array',
  ArgsWrong = 'Expected arguments to be %s, got %s',
  FuncMissing = 'Missing "function" key',
}

interface ValidationContext {
  errors: {
    [key: string]: string;
  };
  errorList: string[];
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

function addError(
  ctx: ValidationContext,
  path: string[],
  message: ValidationErrorMessage,
  ..._params: string[]
) {
  const errIdx = ctx.errorList.length;
  const msg = message.replaceAll('%s', () => {
    return 'hello world';
  });
  const msgRef = `[~errMsgRef-${errIdx}~]`;

  ctx.errorList.push(msg);
  ctx.errors[path.join('.')] = msgRef;
}

function validateFunctionArgs(
  expected: (BaseValue | undefined)[],
  actual: (BaseValue | undefined)[],
  ctx: ValidationContext,
  path: string[],
) {
  if (expected !== actual) {
    addError(
      ctx,
      path,
      ValidationErrorMessage.ArgsWrong,
      JSON.stringify(expected),
      JSON.stringify(actual),
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

  if (funcName in layoutExpressionFunctions) {
    const key = funcName as keyof typeof layoutExpressionFunctions;
    validateFunctionArgs(
      layoutExpressionFunctions[key].args,
      argTypes,
      ctx,
      path,
    );
    return layoutExpressionFunctions[key].returns;
  }

  if (funcName in validLookupFunctions) {
    validateFunctionArgs(['string'], argTypes, ctx, path);
    return 'string';
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

  if (typeof expr === 'undefined' || expr === 'null') {
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
      (key) => key === 'function' || key === 'args',
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
    errorList: [],
  };

  // TODO: Iterate errors and splice them in to produce nice error messages

  if (ctx.errorList.length) {
    // TODO: Throw exception instead
    return undefined;
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
