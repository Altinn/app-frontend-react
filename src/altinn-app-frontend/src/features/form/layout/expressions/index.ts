import type { ExpressionContext } from 'src/features/form/layout/expressions/ExpressionContext';
import type {
  BaseToActual,
  BaseValue,
  FuncDef,
  ILayoutExpression,
  ILayoutExpressionLookupFunctions,
} from 'src/features/form/layout/expressions/types';

/**
 * Run/evaluate a layout expression. You have to provide your own functions for looking up external values. If you
 * need a more concrete implementation:
 * @see useLayoutExpression
 */
export function evalExpr(
  expr: ILayoutExpression,
  context: ExpressionContext,
): boolean {
  // TODO: When expression evaluation fails in runtime, report errors (with detailed description of why it went wrong)

  const argTypes =
    expr.function in context.lookup
      ? ['string']
      : layoutExpressionFunctions[expr.function].args;
  const returnType =
    expr.function in context.lookup
      ? 'string'
      : layoutExpressionFunctions[expr.function].returns;

  const computedArgs = expr.args.map((arg, idx) => {
    const out =
      typeof arg === 'object' && arg !== null ? evalExpr(arg, context) : arg;

    return layoutExpressionCastToType[argTypes[idx]](out);
  });

  const actualFunc: (...args: any) => any =
    expr.function in context.lookup
      ? context.lookup[expr.function]
      : layoutExpressionFunctions[expr.function].impl;

  return layoutExpressionCastToType[returnType](actualFunc(...computedArgs));
}

export class ExpressionRuntimeError extends Error {}

export class LookupNotFound extends ExpressionRuntimeError {
  public constructor(
    lookup: keyof ILayoutExpressionLookupFunctions,
    key: string,
    extra?: string,
  ) {
    super(
      `Unable to find ${lookup} with identifier ${key}${
        extra ? ` ${extra}` : ''
      }`,
    );
  }
}

export class UnexpectedType extends ExpressionRuntimeError {
  public constructor(expected: string, actual: any) {
    super(`Expected ${expected}, got value ${JSON.stringify(actual)}`);
  }
}

function defineFunc<Args extends BaseValue[], Ret extends BaseValue>(
  def: FuncDef<Args, Ret>,
): FuncDef<Args, Ret> {
  return def;
}

export const layoutExpressionFunctions = {
  equals: defineFunc({
    impl: (arg1, arg2) => arg1 == arg2,
    args: ['string', 'string'],
    returns: 'boolean',
  }),
  notEquals: defineFunc({
    impl: (arg1, arg2) => arg1 != arg2,
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

export const layoutExpressionCastToType: {
  [Type in BaseValue]: (arg: any) => BaseToActual<Type>;
} = {
  boolean: (arg) => {
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
    throw new UnexpectedType('boolean', arg);
  },
  string: (arg) => {
    if (typeof arg === 'boolean' || typeof arg === 'number') {
      return JSON.stringify(arg);
    }
    if (arg === null || typeof arg === 'undefined') {
      return 'null';
    }

    return arg;
  },
  number: (arg) => {
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

    throw new UnexpectedType('number', arg);
  },
};
