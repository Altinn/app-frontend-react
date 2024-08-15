import {
  ExprRuntimeError,
  UnexpectedType,
  UnknownSourceType,
  UnknownTargetType,
} from 'src/features/expressions/errors';
import { ExprFunctions } from 'src/features/expressions/expression-functions';
import { ExprVal } from 'src/features/expressions/types';
import { getExpressionValue, prettyError, traceExpressionError } from 'src/features/expressions/utils';
import type { NodeNotFoundWithoutContext } from 'src/features/expressions/errors';
import type {
  ExprConfig,
  Expression,
  ExprFunction,
  ExprPositionalArgs,
  ExprValToActual,
  ExprValToActualOrExpr,
} from 'src/features/expressions/types';
import type { ExpressionDataSources } from 'src/features/expressions/utils';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export interface EvalExprOptions {
  config?: ExprConfig;
  errorIntroText?: string;
  onBeforeFunctionCall?: (path: string[], func: ExprFunction, args: any[]) => void;
  onAfterFunctionCall?: (path: string[], func: ExprFunction, args: any[], result: any) => void;
  positionalArguments?: ExprPositionalArgs;
}

export type SimpleEval<T extends ExprVal> = (
  expr: ExprValToActualOrExpr<T> | undefined,
  defaultValue: ExprValToActual<T>,
  dataSources?: Partial<ExpressionDataSources>,
) => ExprValToActual<T>;

export type EvaluateExpressionParams = {
  expr: Expression;
  path: string[];
  callbacks: Pick<EvalExprOptions, 'onBeforeFunctionCall' | 'onAfterFunctionCall'>;
  node: LayoutNode | LayoutPage | NodeNotFoundWithoutContext;
  dataSources: ExpressionDataSources;
  positionalArguments?: ExprPositionalArgs;
};

/**
 * Simple (non-validating) check to make sure an input is an expression.
 * @see ExprValidation
 */
function isExpression(input: unknown): input is Expression {
  return (
    !!input &&
    Array.isArray(input) &&
    input.length >= 1 &&
    typeof input[0] === 'string' &&
    Object.keys(ExprFunctions).includes(input[0])
  );
}

/**
 * Run/evaluate an expression. You have to provide your own context containing functions for looking up external values.
 */
export function evalExpr(
  expr: Expression | ExprValToActual | undefined,
  node: LayoutNode | LayoutPage | NodeNotFoundWithoutContext,
  dataSources: ExpressionDataSources,
  options?: EvalExprOptions,
) {
  if (!isExpression(expr)) {
    return expr;
  }

  const callbacks: Pick<EvalExprOptions, 'onBeforeFunctionCall' | 'onAfterFunctionCall'> = {
    onBeforeFunctionCall: options?.onBeforeFunctionCall,
    onAfterFunctionCall: options?.onAfterFunctionCall,
  };
  const ctx: EvaluateExpressionParams = {
    expr,
    path: [],
    callbacks,
    node,
    dataSources,
    positionalArguments: options?.positionalArguments,
  };

  try {
    const result = innerEvalExpr(ctx);
    if ((result === null || result === undefined) && options?.config) {
      return options.config.defaultValue;
    }

    if (
      options &&
      options.config &&
      options.config.returnType !== ExprVal.Any &&
      options.config.returnType !== valueToExprValueType(result)
    ) {
      // If you have an expression that expects (for example) a true|false return value, and the actual returned result
      // is "true" (as a string), it makes sense to finally cast the value to the proper return value type.
      return castValue(result, options.config.returnType, ctx);
    }

    return result;
  } catch (err) {
    const { expr: errorExpr, path: errorPath } =
      err instanceof ExprRuntimeError ? { expr: err.expression, path: err.path } : { expr: ctx.expr, path: ctx.path };

    if (options && options.config) {
      // When we know of a default value, we can safely print it as an error to the console and safely recover
      traceExpressionError(err, errorExpr, errorPath, {
        config: options.config,
        ...(options.errorIntroText ? { introText: options.errorIntroText } : {}),
      });
      return options.config.defaultValue;
    } else {
      // We cannot possibly know the expected default value here, so there are no safe ways to fail here except
      // throwing the exception to let everyone know we failed.
      throw new Error(prettyError(err, errorExpr, errorPath));
    }
  }
}

export function argTypeAt(func: ExprFunction, argIndex: number): ExprVal | undefined {
  const funcDef = ExprFunctions[func];
  const possibleArgs = funcDef.args;
  const maybeReturn = possibleArgs[argIndex];
  if (maybeReturn) {
    return maybeReturn;
  }

  if (funcDef.lastArgSpreads) {
    return possibleArgs[possibleArgs.length - 1];
  }

  return undefined;
}

function innerEvalExpr(ctx: EvaluateExpressionParams): any {
  const { expr, path } = ctx;
  const [func, ...args] = getExpressionValue(expr, path);

  const returnType = ExprFunctions[func].returns;

  const computedArgs = args.map((arg: unknown, idx: number) => {
    const realIdx = idx + 1;

    const ctxWithNewPath = { ...ctx, path: [...path, `[${realIdx}]`] };
    const argValue = Array.isArray(arg) ? innerEvalExpr(ctxWithNewPath) : arg;
    const argType = argTypeAt(func, idx);
    return castValue(argValue, argType, ctxWithNewPath);
  });

  const { onBeforeFunctionCall, onAfterFunctionCall } = ctx.callbacks;

  const actualFunc = ExprFunctions[func].impl;

  onBeforeFunctionCall?.(path, func, computedArgs);
  const returnValue = actualFunc.apply(ctx, computedArgs);
  const returnValueCasted = castValue(returnValue, returnType, ctx);
  onAfterFunctionCall?.(path, func, computedArgs, returnValueCasted);

  return returnValueCasted;
}

function valueToExprValueType(value: unknown): ExprVal {
  if (typeof value === 'number' || typeof value === 'bigint') {
    return ExprVal.Number;
  }
  if (typeof value === 'string') {
    return ExprVal.String;
  }
  if (typeof value === 'boolean') {
    return ExprVal.Boolean;
  }

  return ExprVal.Any;
}

function isLikeNull(arg: unknown) {
  return arg === 'null' || arg === null || arg === undefined;
}

/**
 * This function is used to cast any value to a target type before/after it is passed
 * through a function call.
 */
function castValue<T extends ExprVal>(
  value: unknown,
  toType: T | undefined,
  context: EvaluateExpressionParams,
): ExprValToActual<T> | null {
  if (!toType || !(toType in ExprTypes)) {
    throw new UnknownTargetType(context.expr, context.path, toType ? toType : typeof toType);
  }

  const typeObj = ExprTypes[toType];

  if (typeObj.nullable && isLikeNull(value)) {
    return null;
  }

  const valueType = valueToExprValueType(value);
  if (!typeObj.accepts.includes(valueType)) {
    const supported = [...typeObj.accepts, ...(typeObj.nullable ? ['null'] : [])].join(', ');
    throw new UnknownSourceType(context.expr, context.path, typeof value, supported);
  }

  return typeObj.impl.apply(context, [value]);
}

function asNumber(arg: string) {
  if (arg.match(/^-?\d+$/)) {
    return parseInt(arg, 10);
  }
  if (arg.match(/^-?\d+\.\d+$/)) {
    return parseFloat(arg);
  }

  return undefined;
}

/**
 * All the types available in expressions, along with functions to cast possible values to them
 * @see castValue
 */
export const ExprTypes: {
  [Type in ExprVal]: {
    nullable: boolean;
    accepts: ExprVal[];
    impl: (this: EvaluateExpressionParams, arg: any) => ExprValToActual<Type> | null;
  };
} = {
  [ExprVal.Boolean]: {
    nullable: true,
    accepts: [ExprVal.Boolean, ExprVal.String, ExprVal.Number, ExprVal.Any],
    impl(arg) {
      if (typeof arg === 'boolean') {
        return arg;
      }
      if (arg === 'true') {
        return true;
      }
      if (arg === 'false') {
        return false;
      }

      if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'bigint') {
        const num = typeof arg === 'string' ? asNumber(arg) : arg;
        if (num !== undefined) {
          if (num === 1) {
            return true;
          }
          if (num === 0) {
            return false;
          }
        }
      }

      throw new UnexpectedType(this.expr, this.path, 'boolean', arg);
    },
  },
  [ExprVal.String]: {
    nullable: true,
    accepts: [ExprVal.Boolean, ExprVal.String, ExprVal.Number, ExprVal.Any],
    impl(arg) {
      if (['number', 'bigint', 'boolean'].includes(typeof arg)) {
        return JSON.stringify(arg);
      }

      // Always lowercase these values, to make comparisons case-insensitive
      if (arg.toLowerCase() === 'null') {
        return null;
      }
      if (arg.toLowerCase() === 'false') {
        return 'false';
      }
      if (arg.toLowerCase() === 'true') {
        return 'true';
      }

      return `${arg}`;
    },
  },
  [ExprVal.Number]: {
    nullable: true,
    accepts: [ExprVal.Boolean, ExprVal.String, ExprVal.Number, ExprVal.Any],
    impl(arg) {
      if (typeof arg === 'number' || typeof arg === 'bigint') {
        return arg as number;
      }
      if (typeof arg === 'string') {
        const num = asNumber(arg);
        if (num !== undefined) {
          return num;
        }
      }

      throw new UnexpectedType(this.expr, this.path, 'number', arg);
    },
  },
  [ExprVal.Any]: {
    nullable: true,
    accepts: [ExprVal.Boolean, ExprVal.String, ExprVal.Number, ExprVal.Any],
    impl: (arg) => arg,
  },
};
