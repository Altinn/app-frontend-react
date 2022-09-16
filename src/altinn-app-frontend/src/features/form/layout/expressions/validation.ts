import dot from 'dot-object';

import {
  argTypeAt,
  LEDefaultsForComponent,
  LEDefaultsForGroup,
  LEFunctions,
  LETypes,
} from 'src/features/form/layout/expressions';
import {
  prettyErrors,
  prettyErrorsToConsole,
} from 'src/features/form/layout/expressions/prettyErrors';
import type { ILayout } from 'src/features/form/layout';
import type {
  BaseValue,
  LayoutExpression,
  LEFunction,
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

function validateFunctionArg(
  func: LEFunction,
  idx: number,
  actual: (BaseValue | undefined)[],
  ctx: ValidationContext,
  path: string[],
) {
  const expectedType = argTypeAt(func, idx);
  const actualType = actual[idx];
  if (expectedType === undefined) {
    addError(
      ctx,
      [...path, `args[${idx}]`],
      ValidationErrorMessage.ArgUnexpected,
    );
  } else {
    const targetType = LETypes[expectedType];

    if (actualType === undefined) {
      if (targetType.nullable) {
        return;
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

function validateFunctionArgs(
  func: LEFunction,
  actual: (BaseValue | undefined)[],
  ctx: ValidationContext,
  path: string[],
) {
  const expected = LEFunctions[func].args;

  let minExpected = LEFunctions[func]?.minArguments;
  if (minExpected === undefined) {
    minExpected = expected.length;
  }
  const canSpread = LEFunctions[func].lastArgSpreads;

  const maxIdx = Math.max(expected.length, actual.length);
  for (let idx = 0; idx < maxIdx; idx++) {
    validateFunctionArg(func, idx, actual, ctx, path);
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

  if (funcName in LEFunctions) {
    validateFunctionArgs(funcName as LEFunction, argTypes, ctx, pathArgs);
    return LEFunctions[funcName].returns;
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

function validateObject(expr: any, ctx: ValidationContext, path: string[]) {
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
    addError(ctx, [...path, otherKey], ValidationErrorMessage.UnknownProperty);
  }

  return returnVal;
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
    return validateObject(expr, ctx, path);
  }

  addError(ctx, path, ValidationErrorMessage.InvalidType, typeof expr);
}

function canBeLispLike(expr: any): expr is [] {
  return Array.isArray(expr) && expr.length >= 1 && typeof expr[0] === 'string';
}

function canBeVerboseExpr(
  expr: any,
): expr is { function: string; args: any[] } {
  return (
    typeof expr === 'object' &&
    expr !== null &&
    'function' in expr &&
    'args' in expr
  );
}

function unrollRecursively(
  maybeExpr: any,
  path: string[],
  ctx: ValidationContext,
): any {
  if (canBeLispLike(maybeExpr)) {
    return unrollArray(maybeExpr, path, ctx);
  }

  if (
    typeof maybeExpr === 'object' &&
    maybeExpr !== null &&
    'function' in maybeExpr &&
    'args' in maybeExpr &&
    Array.isArray(maybeExpr.args)
  ) {
    for (const idx in maybeExpr.args) {
      maybeExpr.args[idx] = unrollRecursively(
        maybeExpr.args[idx],
        [...path, `args[${idx}]`],
        ctx,
      );
    }
  }

  return maybeExpr;
}

/**
 * Takes an array and parses it as a lisp-like minimal layout expression, using the format:
 *  ['function name', 'arg1', 'arg2', 'arg3', ...]
 */
function unrollArray(expr: any[], path: string[], ctx: ValidationContext): any {
  const [func, ...args] = expr;

  return {
    function: func,
    args: args.map((arg, idx) =>
      unrollRecursively(arg, [...path, idx.toString()], ctx),
    ),
  };
}

/**
 * Takes the input object, validates it to make sure it is a valid layout expression, returns either a fully
 * parsed verbose expression (ready to pass to evalExpr()), or undefined (if not a valid expression).
 *
 * @param obj Input, can be anything
 * @param defaultValue Default value (returned if the expression fails to validate)
 * @param errorText Error intro text used when printing to console or throwing an error
 */
export function asLayoutExpression(
  obj: any,
  defaultValue: any = undefined,
  errorText = 'Invalid layout expression',
): LayoutExpression | undefined {
  if (typeof obj !== 'object' || obj === null) {
    return undefined;
  }

  let expr = obj;
  const ctx: ValidationContext = { errors: {} };

  if (canBeLispLike(expr)) {
    expr = unrollArray(expr, [], ctx);
  }

  if ('function' in expr && 'args' in expr) {
    validateRecursively(expr, ctx, []);
  }

  if (Object.keys(ctx.errors).length) {
    if (typeof defaultValue !== 'undefined') {
      const prettyPrinted = prettyErrorsToConsole({
        input: expr,
        errors: ctx.errors,
        indentation: 1,
        defaultStyle: '',
      });

      // eslint-disable-next-line no-console
      console.log(
        [
          `${errorText}:`,
          prettyPrinted.lines,
          '%cUsing default value instead:',
          `  %c${defaultValue.toString()}%c`,
        ].join('\n'),
        ...prettyPrinted.css,
        ...['', 'color: red;', ''],
      );

      return defaultValue;
    }

    throw new InvalidExpression(
      `${errorText}:\n${prettyErrors({
        input: expr,
        errors: ctx.errors,
        indentation: 1,
      })}`,
    );
  } else if (canBeVerboseExpr(expr)) {
    return expr as LayoutExpression;
  }
}

function preProcessComponent(
  input: any,
  defaults: Record<string, any>,
  componentPath: string[],
  componentId: string,
): any {
  const pathStr = componentPath.join('.');
  if (pathStr in defaults) {
    if (typeof input === 'object' && input !== null) {
      const errText = `Invalid layout expression when parsing ${pathStr} for "${componentId}"`;
      return asLayoutExpression(input, defaults[pathStr], errText);
    }

    return input;
  }

  if (typeof input === 'object' && !Array.isArray(input) && input !== null) {
    for (const property of Object.keys(input)) {
      input[property] = preProcessComponent(
        input[property],
        defaults,
        [...componentPath, property],
        componentId,
      );
    }
  }

  return input;
}

/**
 * Pre-process a layout array. This iterates all components and makes sure to rewrite lisp-like expressions to full
 * expressions, and make sure to validate expressions (making sure they are valid according to the LayoutExpression
 * TypeScript type, ready to pass to evalExpr()).
 *
 * If/when expressions inside components does not validate correctly, a warning is printed to the console, and the
 * expression is substituted with the appropriate default value.
 *
 * Please note: This mutates the layout array passed to the function, and returns nothing.
 */
export function preProcessLayout(layout: ILayout) {
  const defaults = dot.dot({
    ...LEDefaultsForComponent,
    ...LEDefaultsForGroup,
  });

  for (const comp of layout) {
    preProcessComponent(comp, defaults, [], comp.id);
  }
}
