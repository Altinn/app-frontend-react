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
  InvalidType = 'Invalid type "%s"',
  FuncNotImpl = 'Function "%s" not implemented',
  ArgUnexpected = 'Unexpected argument',
  ArgWrongType = 'Expected argument to be %s, got %s',
  ArgsWrongNum = 'Expected %s argument(s), got %s',
  FuncMissing = 'Missing function name in expression',
  FuncNotString = 'Function name in expression should be string',
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
  const stringPath = path.join('');
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
    addError(ctx, [...path, `[${idx}]`], ValidationErrorMessage.ArgUnexpected);
  } else {
    const targetType = LETypes[expectedType];

    if (actualType === undefined) {
      if (targetType.nullable) {
        return;
      }
      addError(
        ctx,
        [...path, `[${idx}]`],
        ValidationErrorMessage.ArgWrongType,
        expectedType,
        'null',
      );
    }

    if (!targetType.accepts.includes(actualType)) {
      addError(
        ctx,
        [...path, `[${idx}]`],
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
      path,
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
  const args: (BaseValue | undefined)[] = [];

  for (const argIdx in rawArgs) {
    const idx = parseInt(argIdx) + 1;
    args.push(validateRecursively(rawArgs[argIdx], ctx, [...path, `[${idx}]`]));
  }

  return validateFunction(func, args, ctx, [...path, '[0]']);
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

  if (Array.isArray(expr)) {
    return validateExpr(expr, ctx, path);
  }

  addError(ctx, path, ValidationErrorMessage.InvalidType, typeof expr);
}

/**
 * Checks anything and returns true if it _could_ be an expression (but is not guaranteed to be one, and does not
 * validate the expression). This is `asLayoutExpression` light, without any error logging to console if it fails.
 */
export function canBeExpression(expr: any): expr is [] {
  return Array.isArray(expr) && expr.length >= 1 && typeof expr[0] === 'string';
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
  if (typeof obj !== 'object' || obj === null || !Array.isArray(obj)) {
    return undefined;
  }

  const ctx: ValidationContext = { errors: {} };
  validateRecursively(obj, ctx, []);

  if (Object.keys(ctx.errors).length) {
    if (typeof defaultValue !== 'undefined') {
      const prettyPrinted = prettyErrorsToConsole({
        input: obj,
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

    const pretty = prettyErrors({
      input: obj,
      errors: ctx.errors,
      indentation: 1,
    });
    throw new InvalidExpression(`${errorText}:\n${pretty}`);
  }

  return obj as unknown as LayoutExpression;
}

export function preProcessItem(
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
      input[property] = preProcessItem(
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
 * Pre-process a layout array. This iterates all components and makes sure to validate expressions (making sure they
 * are valid according to the LayoutExpression TypeScript type, ready to pass to evalExpr()).
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
    preProcessItem(comp, defaults, [], comp.id);
  }
}
