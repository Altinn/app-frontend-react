import { argTypeAt, ExprFunctions, ExprTypes } from 'src/features/expressions';
import { prettyErrors } from 'src/features/expressions/prettyErrors';
import { ExprVal } from 'src/features/expressions/types';
import type {
  Expression,
  ExprFunction,
  ExprValToActual,
  ExprValToActualOrExpr,
  FuncDef,
} from 'src/features/expressions/types';

enum ValidationErrorMessage {
  InvalidType = 'Invalid type "%s"',
  FuncNotImpl = 'Function "%s" not implemented',
  ArgUnexpected = 'Unexpected argument',
  ArgWrongType = 'Expected argument to be %s, got %s',
  ArgsWrongNum = 'Expected %s argument(s), got %s',
  FuncMissing = 'Missing function name in expression',
  FuncNotString = 'Function name in expression should be string',
}

export interface ValidationContext {
  errors: {
    [key: string]: string[];
  };
}

const validBasicTypes: { [key: string]: ExprVal } = {
  boolean: ExprVal.Boolean,
  string: ExprVal.String,
  bigint: ExprVal.Number,
  number: ExprVal.Number,
};

export class InvalidExpression extends Error {}

export function addError(
  ctx: ValidationContext,
  path: string[],
  message: ValidationErrorMessage | string,
  ...params: string[]
) {
  let paramIdx = 0;
  const newMessage = message.replaceAll('%s', () => params[paramIdx++]);
  const stringPath = path.join('');
  if (ctx.errors[stringPath]) {
    ctx.errors[stringPath].push(newMessage);
  } else {
    ctx.errors[stringPath] = [newMessage];
  }
}

function validateFunctionArg(
  func: ExprFunction,
  idx: number,
  actual: (ExprVal | undefined)[],
  ctx: ValidationContext,
  path: string[],
) {
  const expectedType = argTypeAt(func, idx);
  const actualType = actual[idx];
  if (expectedType === undefined) {
    addError(ctx, [...path, `[${idx + 1}]`], ValidationErrorMessage.ArgUnexpected);
  } else {
    const targetType = ExprTypes[expectedType];

    if (actualType === undefined) {
      if (targetType.nullable) {
        return;
      }
      addError(ctx, [...path, `[${idx + 1}]`], ValidationErrorMessage.ArgWrongType, expectedType, 'null');
    } else if (!targetType.accepts.includes(actualType)) {
      addError(ctx, [...path, `[${idx + 1}]`], ValidationErrorMessage.ArgWrongType, expectedType, 'null');
    }
  }
}

function validateFunctionArgs(
  func: ExprFunction,
  actual: (ExprVal | undefined)[],
  ctx: ValidationContext,
  path: string[],
) {
  const expected = ExprFunctions[func].args;
  const maxIdx = Math.max(expected.length, actual.length);
  for (let idx = 0; idx < maxIdx; idx++) {
    validateFunctionArg(func, idx, actual, ctx, path);
  }
}

function validateFunctionArgLength(
  func: ExprFunction,
  actual: (ExprVal | undefined)[],
  ctx: ValidationContext,
  path: string[],
) {
  const expected = ExprFunctions[func].args;

  let minExpected = ExprFunctions[func]?.minArguments;
  if (minExpected === undefined) {
    minExpected = expected.length;
  }

  const canSpread = ExprFunctions[func].lastArgSpreads;
  if (canSpread && actual.length >= minExpected) {
    return;
  }

  const maxExpected = ExprFunctions[func]?.args.length;
  if (actual.length < minExpected || actual.length > maxExpected) {
    let expected = `${minExpected}`;
    if (canSpread) {
      expected += '+';
    } else if (maxExpected !== minExpected) {
      expected += `-${maxExpected}`;
    }

    addError(ctx, path, ValidationErrorMessage.ArgsWrongNum, `${expected}`, `${actual.length}`);
  }
}

function validateFunction(
  funcName: any,
  rawArgs: any[],
  argTypes: (ExprVal | undefined)[],
  ctx: ValidationContext,
  path: string[],
): ExprVal | undefined {
  if (typeof funcName !== 'string') {
    addError(ctx, path, ValidationErrorMessage.InvalidType, typeof funcName);
    return;
  }

  const pathArgs = [...path.slice(0, path.length - 1)];

  if (funcName in ExprFunctions) {
    validateFunctionArgs(funcName as ExprFunction, argTypes, ctx, pathArgs);

    const def = ExprFunctions[funcName] as FuncDef<any, any>;
    if (def.validator) {
      def.validator({ rawArgs, argTypes, ctx, path: pathArgs });
    } else {
      validateFunctionArgLength(funcName as ExprFunction, argTypes, ctx, pathArgs);
    }

    return def.returns;
  }

  addError(ctx, path, ValidationErrorMessage.FuncNotImpl, funcName);
}

function validateExpr(expr: any[], ctx: ValidationContext, path: string[]) {
  if (expr.length < 1) {
    addError(ctx, path, ValidationErrorMessage.FuncMissing);
    return undefined;
  }

  if (typeof expr[0] !== 'string') {
    addError(ctx, path, ValidationErrorMessage.FuncNotString);
    return undefined;
  }

  const [func, ...rawArgs] = expr;
  const args: (ExprVal | undefined)[] = [];

  for (const argIdx in rawArgs) {
    const idx = parseInt(argIdx) + 1;
    args.push(validateRecursively(rawArgs[argIdx], ctx, [...path, `[${idx}]`]));
  }

  return validateFunction(func, rawArgs, args, ctx, [...path, '[0]']);
}

function validateRecursively(expr: any, ctx: ValidationContext, path: string[]): ExprVal | undefined {
  if (validBasicTypes[typeof expr]) {
    return validBasicTypes[typeof expr];
  }

  if (typeof expr === 'undefined' || expr === null) {
    return;
  }

  if (Array.isArray(expr)) {
    return validateExpr(expr, ctx, path);
  }

  addError(ctx, path, ValidationErrorMessage.InvalidType, typeof expr);
}

/**
 * Checks anything and returns true if it _could_ be an expression (but is not guaranteed to be one, and does not
 * validate the expression). This is `asExpression` light, without any error logging to console if it fails.
 */
export function canBeExpression(expr: any, checkIfValidFunction = false): expr is [] {
  const firstPass = Array.isArray(expr) && expr.length >= 1 && typeof expr[0] === 'string';
  if (checkIfValidFunction && firstPass) {
    return expr[0] in ExprFunctions;
  }

  return firstPass;
}

const alreadyValidatedExpressions = new Map<string, boolean>();

/**
 * @param obj Input, can be anything
 * @param errorText Error intro text used when printing to console or throwing an error
 */
function isValidExpr(obj: unknown, errorText = 'Invalid expression'): obj is Expression {
  const cacheKey = JSON.stringify(obj);
  const previousRun = alreadyValidatedExpressions.get(cacheKey);
  if (typeof previousRun === 'boolean') {
    return previousRun;
  }

  const ctx: ValidationContext = { errors: {} };
  validateRecursively(obj, ctx, []);

  if (Object.keys(ctx.errors).length) {
    const pretty = prettyErrors({
      input: obj,
      errors: ctx.errors,
      indentation: 1,
    });
    const fullMessage = `${errorText}:\n${pretty}`;

    window.logError(fullMessage);
    alreadyValidatedExpressions.set(cacheKey, false);
    return false;
  }

  alreadyValidatedExpressions.set(cacheKey, true);
  return true;
}

function isScalar(val: unknown, type: ExprVal | undefined) {
  if (val === null || val === undefined) {
    return true;
  }

  if (type === ExprVal.String) {
    return typeof val === 'string';
  }
  if (type === ExprVal.Number) {
    return typeof val === 'number';
  }
  if (type === ExprVal.Boolean) {
    return typeof val === 'boolean';
  }

  return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';
}

export function throwIfInvalid(obj: unknown, errorText = 'Invalid expression'): asserts obj is Expression {
  const ctx: ValidationContext = { errors: {} };
  validateRecursively(obj, ctx, []);

  if (Object.keys(ctx.errors).length) {
    const pretty = prettyErrors({
      input: obj,
      errors: ctx.errors,
      indentation: 1,
    });
    const fullMessage = `${errorText}:\n${pretty}`;
    throw new InvalidExpression(fullMessage);
  }
}

function isValidOrScalar<EV extends ExprVal>(
  obj: unknown,
  type: EV,
  errorText?: string,
): obj is ExprValToActualOrExpr<EV>;
function isValidOrScalar(obj: unknown, type?: undefined, errorText?: string): obj is ExprValToActualOrExpr<ExprVal.Any>;
function isValidOrScalar(obj: unknown, type?: ExprVal, errorText?: string): boolean {
  return isScalar(obj, type) || isValidExpr(obj, errorText);
}

function isNotValid<EV extends ExprVal>(
  obj: ExprValToActualOrExpr<EV>,
  type: EV,
  errorText?: string,
): obj is ExprValToActual<EV>;
function isNotValid(
  obj: ExprValToActualOrExpr<ExprVal.Any>,
  type?: undefined,
  errorText?: string,
): obj is ExprValToActual<ExprVal.Any>;
function isNotValid(obj: unknown, type?: ExprVal, errorText?: string): obj is ExprValToActual<ExprVal.Any> {
  return !isValidExpr(obj, errorText) && isScalar(obj, type);
}

function throwIfInvalidNorScalar<EV extends ExprVal>(obj: unknown, type: EV, errorText?: string): void;
function throwIfInvalidNorScalar(obj: unknown, type?: undefined, errorText?: string): void;
function throwIfInvalidNorScalar(obj: unknown, type?: ExprVal, errorText?: string): void {
  if (!isScalar(obj, type)) {
    throwIfInvalid(obj, errorText);
  }
}

export const ExprValidation = {
  /**
   * Takes the input object, validates it to make sure it is a valid expression OR a simple scalar that can be
   * used in place of an expression. If the expression is invalid, an error is logged to the developer tools
   * (unless the same expression has logged errors before).
   */
  isValidOrScalar,

  /**
   * Checks an input object and only returns true if it is an expression, and that expression is valid.
   */
  isValid(obj: unknown, errorText?: string): obj is Expression {
    return isValidExpr(obj, errorText);
  },

  /**
   * Utility that achieves the same as the above, but is more useful to narrow ExprValToActualOrExpr to actual valid
   * types (string, number, etc). If you just call isValidExpr() on such a type, in the case that it's not a valid
   * expression it may also be an array containing an invalid expression (which is possible). Since invalid expressions
   * should not be evaluated, you should combine this with a call to isValidExpr() as well.
   */
  isNotValid,

  /**
   * The same as the above, but just throws an error if the expression fails. Useful for tests, etc.
   */
  throwIfInvalidNorScalar,
};
