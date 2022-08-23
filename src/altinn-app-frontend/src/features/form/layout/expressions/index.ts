import {
  ExpressionRuntimeError,
  UnexpectedType,
} from 'src/features/form/layout/expressions/errors';
import { ExpressionContext } from 'src/features/form/layout/expressions/ExpressionContext';
import type { ContextDataSources } from 'src/features/form/layout/expressions/ExpressionContext';
import type {
  BaseToActual,
  BaseValue,
  FuncDef,
  ILayoutExpression,
} from 'src/features/form/layout/expressions/types';
import type { LayoutNode } from 'src/utils/layout/hierarchy';

export interface EvalExprOptions {
  defaultValue?: any;
  errorIntroText?: string;
}

/**
 * Run/evaluate a layout expression. You have to provide your own context containing functions for looking up external
 * values. If you need a more concrete implementation:
 * @see useLayoutExpression
 */
export function evalExpr(
  expr: ILayoutExpression,
  node: LayoutNode | string,
  dataSources: ContextDataSources,
  options?: EvalExprOptions,
) {
  let ctx = ExpressionContext.withBlankPath(expr, node, dataSources);
  try {
    return innerEvalExpr(ctx);
  } catch (err) {
    if (err instanceof ExpressionRuntimeError) {
      ctx = err.context;
    }
    if (options && 'defaultValue' in options) {
      // When we know of a default value, we can safely print it as an error to the console and safely recover
      ctx.trace(err, {
        defaultValue: options.defaultValue,
        ...(options.errorIntroText
          ? { introText: options.errorIntroText }
          : {}),
      });
      return options.defaultValue;
    } else {
      // We cannot possibly know the expected default value here, so there are no safe ways to fail here except
      // throwing the exception to let everyone know we failed.
      throw new Error(ctx.prettyError(err));
    }
  }
}

function innerEvalExpr(context: ExpressionContext) {
  const expr = context.getExpr();

  const argTypes =
    expr.function in context.lookup
      ? ['string']
      : layoutExpressionFunctions[expr.function].args;
  const returnType =
    expr.function in context.lookup
      ? 'string'
      : layoutExpressionFunctions[expr.function].returns;

  const computedArgs = expr.args.map((arg, idx) => {
    const argContext = ExpressionContext.withPath(context, [
      ...context.path,
      `args[${idx}]`,
    ]);

    const argValue =
      typeof arg === 'object' && arg !== null ? innerEvalExpr(argContext) : arg;

    return castValue(argValue, argTypes[idx], argContext);
  });

  const actualFunc: (...args: any) => any =
    expr.function in context.lookup
      ? context.lookup[expr.function]
      : layoutExpressionFunctions[expr.function].impl;

  const returnValue = actualFunc.apply(context, computedArgs);
  return castValue(returnValue, returnType, context);
}

function castValue<T extends BaseValue>(
  value: any,
  toType: T,
  context: ExpressionContext,
): BaseToActual<T> {
  if (!(toType in layoutExpressionCastToType)) {
    throw new Error(`Cannot cast to type: ${JSON.stringify(toType)}`);
  }

  return layoutExpressionCastToType[toType].apply(context, [value]);
}

function defineFunc<Args extends BaseValue[], Ret extends BaseValue>(
  def: FuncDef<Args, Ret>,
): FuncDef<Args, Ret> {
  return def;
}

export const layoutExpressionFunctions = {
  equals: defineFunc({
    impl: (arg1, arg2) => arg1 === arg2,
    args: ['string', 'string'],
    returns: 'boolean',
  }),
  notEquals: defineFunc({
    impl: (arg1, arg2) => arg1 !== arg2,
    args: ['string', 'string'],
    returns: 'boolean',
  }),
  greaterThan: defineFunc({
    impl: (arg1, arg2) => arg1 > arg2,
    args: ['number', 'number'],
    returns: 'boolean',
  }),
  greaterThanEq: defineFunc({
    impl: (arg1, arg2) => arg1 >= arg2,
    args: ['number', 'number'],
    returns: 'boolean',
  }),
  lessThan: defineFunc({
    impl: (arg1, arg2) => arg1 < arg2,
    args: ['number', 'number'],
    returns: 'boolean',
  }),
  lessThanEq: defineFunc({
    impl: (arg1, arg2) => arg1 <= arg2,
    args: ['number', 'number'],
    returns: 'boolean',
  }),
};

function isLikeNull(arg: any) {
  return arg === 'null' || arg === null || typeof arg === 'undefined';
}

export const layoutExpressionCastToType: {
  [Type in BaseValue]: (
    this: ExpressionContext,
    arg: any,
  ) => BaseToActual<Type>;
} = {
  boolean: function (arg) {
    if (typeof arg === 'boolean') {
      return arg;
    }
    if (typeof arg === 'string') {
      if (arg === 'true') return true;
      if (arg === 'false') return false;
      if (arg === '1') return true;
      if (arg === '0') return false;
    }
    if (typeof arg === 'number') {
      if (arg === 1) return true;
      if (arg === 0) return false;
    }
    if (isLikeNull(arg)) {
      return null;
    }
    throw new UnexpectedType(this, 'boolean', arg);
  },
  string: function (arg) {
    if (typeof arg === 'boolean' || typeof arg === 'number') {
      return JSON.stringify(arg);
    }
    if (isLikeNull(arg)) {
      return null;
    }

    return arg;
  },
  number: function (arg) {
    if (typeof arg === 'number' || typeof arg === 'bigint') {
      return arg as number;
    }
    if (typeof arg === 'string') {
      if (arg.match(/^\d+$/)) {
        return parseInt(arg, 10);
      }
      if (arg.match(/^[\d.]+$/)) {
        return parseFloat(arg);
      }
    }
    if (isLikeNull(arg)) {
      return null;
    }

    throw new UnexpectedType(this, 'number', arg);
  },
};
