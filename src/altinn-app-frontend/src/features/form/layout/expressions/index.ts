import dot from 'dot-object';

import {
  LERuntimeError,
  LookupNotFound,
  NodeNotFoundWithoutContext,
  UnexpectedType,
  UnknownSourceType,
  UnknownTargetType,
} from 'src/features/form/layout/expressions/errors';
import { LEContext } from 'src/features/form/layout/expressions/LEContext';
import { asLayoutExpression } from 'src/features/form/layout/expressions/validation';
import type { ILayoutComponent, ILayoutGroup } from 'src/features/form/layout';
import type { ContextDataSources } from 'src/features/form/layout/expressions/LEContext';
import type {
  BaseToActual,
  BaseValue,
  FuncDef,
  LayoutExpression,
  LEDefaultValues,
  LEFunction,
  LEResolved,
} from 'src/features/form/layout/expressions/types';
import type { LayoutNode } from 'src/utils/layout/hierarchy';

export interface EvalExprOptions {
  defaultValue?: any;
  errorIntroText?: string;
}

export interface EvalExprInObjArgs<T> {
  input: T;
  node: LayoutNode<any> | NodeNotFoundWithoutContext;
  dataSources: ContextDataSources;
  defaults?: LEDefaultValues<T>;
  skipPaths?: Set<string | keyof T>;
}

/**
 * This function is the brains behind the useLayoutExpression() hook, as it will find any expressions inside a deep
 * object and resolve them.
 * @see useLayoutExpression
 */
export function evalExprInObj<T>(args: EvalExprInObjArgs<T>): LEResolved<T> {
  if (!args.input) {
    return args.input as LEResolved<T>;
  }

  return evalExprInObjectRecursive(
    args.input,
    args as Omit<EvalExprInObjArgs<T>, 'input'>,
    [],
  );
}

/**
 * Recurse through an input object/array/any, finds layout expressions and evaluates them
 */
function evalExprInObjectRecursive<T>(
  input: any,
  args: Omit<EvalExprInObjArgs<T>, 'input'>,
  path: string[],
) {
  if (typeof input !== 'object') {
    return input;
  }
  const pathString = path.join('.');
  if (args.skipPaths && args.skipPaths.has(pathString)) {
    return input;
  }

  if (Array.isArray(input)) {
    const newPath = [...path];
    const lastLeg = newPath.pop() || '';
    return input.map((item, idx) =>
      evalExprInObjectRecursive(item, args, [...newPath, `${lastLeg}[${idx}]`]),
    );
  }

  const expression = asLayoutExpression(input);
  if (expression) {
    return evalExprInObjectCaller(expression, args, path);
  }

  const out = {};
  for (const key of Object.keys(input)) {
    out[key] = evalExprInObjectRecursive(input[key], args, [...path, key]);
  }

  return out;
}

/**
 * Extracted function for evaluating expressions in the context of a larger object
 */
function evalExprInObjectCaller<T>(
  expr: LayoutExpression,
  args: Omit<EvalExprInObjArgs<T>, 'input'>,
  path: string[],
) {
  const pathString = path.join('.');
  const nodeId =
    args.node instanceof NodeNotFoundWithoutContext
      ? args.node.nodeId
      : args.node.item.id;

  const exprOptions: EvalExprOptions = {
    errorIntroText: `Evaluated expression for '${pathString}' in component '${nodeId}'`,
  };

  if (args.defaults) {
    const defaultValue = dot.pick(pathString, args.defaults);
    if (typeof defaultValue !== 'undefined') {
      exprOptions.defaultValue = defaultValue;
    }
  }

  return evalExpr(expr, args.node, args.dataSources, exprOptions);
}

/**
 * Run/evaluate a layout expression. You have to provide your own context containing functions for looking up external
 * values. If you need a more concrete implementation:
 * @see evalExprInObj
 * @see useLayoutExpression
 */
export function evalExpr(
  expr: LayoutExpression,
  node: LayoutNode<any> | NodeNotFoundWithoutContext,
  dataSources: ContextDataSources,
  options?: EvalExprOptions,
) {
  let ctx = LEContext.withBlankPath(expr, node, dataSources);
  try {
    return innerEvalExpr(ctx);
  } catch (err) {
    if (err instanceof LERuntimeError) {
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

export function argTypeAt(
  func: LEFunction,
  argIndex: number,
): BaseValue | undefined {
  const funcDef = LEFunctions[func];
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

function innerEvalExpr(context: LEContext) {
  const expr = context.getExpr();

  const returnType = LEFunctions[expr.function].returns;

  const computedArgs = expr.args.map((arg, idx) => {
    const argContext = LEContext.withPath(context, [
      ...context.path,
      `args[${idx}]`,
    ]);

    const argValue =
      typeof arg === 'object' && arg !== null ? innerEvalExpr(argContext) : arg;

    const argType = argTypeAt(expr.function, idx);
    return castValue(argValue, argType, argContext);
  });

  const actualFunc: (...args: any) => any = LEFunctions[expr.function].impl;
  const returnValue = actualFunc.apply(context, computedArgs);
  return castValue(returnValue, returnType, context);
}

function valueToBaseValueType(value: any): BaseValue | string {
  if (typeof value === 'number' || typeof value === 'bigint') {
    return 'number';
  }
  return typeof value;
}

function isLikeNull(arg: any) {
  return arg === 'null' || arg === null || typeof arg === 'undefined';
}

/**
 * This function is used to cast any value to a target type before/after it is passed
 * through a function call.
 */
function castValue<T extends BaseValue>(
  value: any,
  toType: T,
  context: LEContext,
): BaseToActual<T> {
  if (!(toType in LETypes)) {
    throw new UnknownTargetType(this, toType);
  }

  const typeObj = LETypes[toType];

  if (typeObj.nullable && isLikeNull(value)) {
    return null;
  }

  const valueBaseType = valueToBaseValueType(value) as BaseValue;
  if (!typeObj.accepts.includes(valueBaseType)) {
    const supported = [
      ...typeObj.accepts,
      ...(typeObj.nullable ? ['null'] : []),
    ].join(', ');
    throw new UnknownSourceType(this, typeof value, supported);
  }

  return typeObj.impl.apply(context, [value]);
}

function defineFunc<Args extends BaseValue[], Ret extends BaseValue>(
  def: FuncDef<Args, Ret>,
): FuncDef<Args, Ret> {
  return def;
}

/**
 * All the functions available to execute inside layout expressions
 */
export const LEFunctions = {
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
    impl: (arg1, arg2) => {
      if (arg1 === null || arg2 === null) {
        return false;
      }

      return arg1 > arg2;
    },
    args: ['number', 'number'],
    returns: 'boolean',
  }),
  greaterThanEq: defineFunc({
    impl: (arg1, arg2) => {
      if (arg1 === null || arg2 === null) {
        return false;
      }

      return arg1 >= arg2;
    },
    args: ['number', 'number'],
    returns: 'boolean',
  }),
  lessThan: defineFunc({
    impl: (arg1, arg2) => {
      if (arg1 === null || arg2 === null) {
        return false;
      }

      return arg1 < arg2;
    },
    args: ['number', 'number'],
    returns: 'boolean',
  }),
  lessThanEq: defineFunc({
    impl: (arg1, arg2) => {
      if (arg1 === null || arg2 === null) {
        return false;
      }

      return arg1 <= arg2;
    },
    args: ['number', 'number'],
    returns: 'boolean',
  }),
  concat: defineFunc({
    impl: (...args) => args.join(''),
    args: ['string'],
    minArguments: 0,
    returns: 'string',
    lastArgSpreads: true,
  }),
  and: defineFunc({
    impl: (...args) => args.reduce((prev, cur) => !!prev && !!cur, true),
    args: ['boolean'],
    returns: 'boolean',
    lastArgSpreads: true,
  }),
  or: defineFunc({
    impl: (...args) => args.reduce((prev, cur) => !!prev || !!cur, false),
    args: ['boolean'],
    returns: 'boolean',
    lastArgSpreads: true,
  }),
  instanceContext: defineFunc({
    impl: function (key) {
      return this.dataSources.instanceContext[key];
    },
    args: ['string'],
    returns: 'string',
  }),
  applicationSettings: defineFunc({
    impl: function (key) {
      return this.dataSources.applicationSettings[key];
    },
    args: ['string'],
    returns: 'string',
  }),
  component: defineFunc({
    impl: function (id): string {
      const component = this.failWithoutNode().closest(
        (c) => c.id === id || c.baseComponentId === id,
      );
      if (
        component &&
        component.item.dataModelBindings &&
        component.item.dataModelBindings.simpleBinding
      ) {
        return this.dataSources.formData[
          component.item.dataModelBindings.simpleBinding
        ];
      }

      throw new LookupNotFound(
        this,
        'component',
        id,
        'or it does not have a simpleBinding',
      );
    },
    args: ['string'],
    returns: 'string',
  }),
  dataModel: defineFunc({
    impl: function (path): string {
      const newPath = this.failWithoutNode().transposeDataModel(path);
      return this.dataSources.formData[newPath] || null;
    },
    args: ['string'],
    returns: 'string',
  }),
};

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
 * All the types available in layout expressions, along with functions to cast possible values to them
 * @see castValue
 */
export const LETypes: {
  [Type in BaseValue]: {
    nullable: boolean;
    accepts: BaseValue[];
    impl: (this: LEContext, arg: any) => BaseToActual<Type>;
  };
} = {
  boolean: {
    nullable: true,
    accepts: ['boolean', 'string', 'number'],
    impl: function (arg) {
      if (typeof arg === 'boolean') {
        return arg;
      }
      if (arg === 'true') return true;
      if (arg === 'false') return false;

      if (
        typeof arg === 'string' ||
        typeof arg === 'number' ||
        typeof arg === 'bigint'
      ) {
        const num = typeof arg === 'string' ? asNumber(arg) : arg;
        if (num !== undefined) {
          if (num === 1) return true;
          if (num === 0) return false;
        }
      }

      throw new UnexpectedType(this, 'boolean', arg);
    },
  },
  string: {
    nullable: true,
    accepts: ['boolean', 'string', 'number'],
    impl: function (arg) {
      if (['number', 'bigint', 'boolean'].includes(typeof arg)) {
        return JSON.stringify(arg);
      }

      // Always lowercase these values, to make comparisons case-insensitive
      if (arg.toLowerCase() === 'null') return null;
      if (arg.toLowerCase() === 'false') return 'false';
      if (arg.toLowerCase() === 'true') return 'true';

      return `${arg}`;
    },
  },
  number: {
    nullable: true,
    accepts: ['boolean', 'string', 'number'],
    impl: function (arg) {
      if (typeof arg === 'number' || typeof arg === 'bigint') {
        return arg as number;
      }
      if (typeof arg === 'string') {
        const num = asNumber(arg);
        if (num !== undefined) {
          return num;
        }
      }

      throw new UnexpectedType(this, 'number', arg);
    },
  },
};

export const LEDefaultsForComponent: LEDefaultValues<ILayoutComponent> = {
  readOnly: false,
  required: false,
  hidden: false,
};

export const LEDefaultsForGroup: LEDefaultValues<ILayoutGroup> = {
  ...LEDefaultsForComponent,
  edit: {
    addButton: true,
    deleteButton: true,
    saveButton: true,
  },
};
