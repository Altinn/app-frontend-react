import type { PickByValue } from 'utility-types';

import type { layoutExpressionFunctions } from 'src/features/form/layout/expressions';
import type { ExpressionContext } from 'src/features/form/layout/expressions/ExpressionContext';

type RealFunctions = typeof layoutExpressionFunctions;
export type LayoutExpressionFunction =
  | keyof RealFunctions
  | keyof ILayoutExpressionLookupFunctions;

export interface ILayoutExpressionLookupFunctions {
  dataModel: (this: ExpressionContext, path: string) => string;
  component: (this: ExpressionContext, baseComponentId: string) => string;
  instanceContext: (this: ExpressionContext, prop: string) => string;
  applicationSettings: (this: ExpressionContext, prop: string) => string;
}

export type BaseValue = 'string' | 'number' | 'boolean';
export type BaseToActual<T extends BaseValue> = T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : never;

/**
 * A version of the type above that avoids spreading union types. Meaning, it only accepts concrete types from inside
 * BaseValue, not the union type BaseValue itself:
 *    type Test1 = BaseToActual<BaseValue>; // string | number | boolean
 *    type Test2 = BaseToActualStrict<BaseValue>; // never
 *
 * @see https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
 */
export type BaseToActualStrict<T extends BaseValue> = [T] extends ['string']
  ? string
  : [T] extends ['number']
  ? number
  : [T] extends ['boolean']
  ? boolean
  : never;

type ArgsToActual<T extends BaseValue[]> = {
  [Index in keyof T]: BaseToActual<T[Index]>;
};

export interface FuncDef<Args extends BaseValue[], Ret extends BaseValue> {
  impl: (
    this: ExpressionContext,
    ...params: ArgsToActual<Args>
  ) => BaseToActual<Ret>;
  args: Args;
  returns: Ret;
}

type ArgsFor<F extends LayoutExpressionFunction> =
  F extends keyof ILayoutExpressionLookupFunctions
    ? ['string']
    : F extends keyof RealFunctions
    ? RealFunctions[F]['args']
    : never;

type RealFunctionsReturning<T extends BaseValue> = keyof PickByValue<
  RealFunctions,
  { returns: T }
>;

type ExpressionReturning<T extends BaseValue> = T extends 'string'
  ? ILayoutExpression<
      keyof ILayoutExpressionLookupFunctions | RealFunctionsReturning<'string'>
    >
  : ILayoutExpression<RealFunctionsReturning<T>>;

type MaybeRecursive<Args extends BaseValue[]> = {
  [Index in keyof Args]:
    | BaseToActual<Args[Index]>
    | ExpressionReturning<Args[Index]>;
};

export interface ILayoutExpression<
  F extends LayoutExpressionFunction = LayoutExpressionFunction,
> {
  function: F;
  args: MaybeRecursive<ArgsFor<F>>;
}

export type ILayoutExpressionOr<T extends BaseValue> =
  | ExpressionReturning<T>
  | BaseToActual<T>;

/**
 * Type that lets you convert a layout expression function name to its return value type
 */
export type ReturnValueFor<Func extends LayoutExpressionFunction> =
  Func extends keyof ILayoutExpressionLookupFunctions
    ? string
    : Func extends keyof RealFunctions
    ? BaseToActual<RealFunctions[Func]['returns']>
    : never;

export type ReturnValueForExpr<Expr extends ILayoutExpression> =
  Expr extends ILayoutExpression<infer Func> ? ReturnValueFor<Func> : never;

/**
 * This is the heavy lifter for ResolvedLayoutExpression that will recursively work through objects and remove
 * layout expressions (replacing them with the type the layout expression is expected to return).
 *
 * @see https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
 */
type ResolveDistributive<T> = [T] extends [any]
  ? [T] extends [ILayoutExpression<infer Func>]
    ? ReturnValueFor<Func>
    : T extends ILayoutExpression
    ? // When using ILayoutExpressionOr<...>, it creates a union type. Removing the ILayoutExpression from this union
      never
    : T extends object
    ? Exclude<ResolvedLayoutExpression<T>, ILayoutExpression>
    : T
  : never;

/**
 * This type removes all layout expressions from the input type (replacing them with the type
 * the layout expression is expected to return)
 *
 * @see https://stackoverflow.com/a/54487392
 */
export type ResolvedLayoutExpression<T> = {
  [P in keyof T]: ResolveDistributive<T[P]>;
};

/**
 * This type can be self-references in order to limit recursion depth for advanced types
 * @see https://stackoverflow.com/a/70552078
 */
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Removes all properties from an object where its keys point to never types. This turns { defunctProp: never } into {}
 */
type OmitNeverKeys<T> = {
  [P in keyof T as T[P] extends never ? never : P]: T[P];
};

type OmitEmptyObjects<T> = T extends Record<string, never> ? never : T;

type OmitNeverArrays<T> = T extends never[] ? never : T;

/**
 * This is the heavy lifter used by LayoutExpressionDefaultValues to recursively iterate types
 */
type ReplaceDistributive<T, Iterations extends Prev[number]> = [T] extends [
  ILayoutExpressionOr<infer BT>,
]
  ? BaseToActualStrict<BT>
  : [T] extends [object]
  ? OmitEmptyObjects<LayoutExpressionDefaultValues<T, Prev[Iterations]>>
  : never;

/**
 * This type looks through an object recursively, finds any layout expressions, and requires you to provide a default
 * value for them (i.e. a fallback value should the layout expression evaluation fail).
 */
export type LayoutExpressionDefaultValues<
  T,
  Iterations extends Prev[number] = 1, // <-- Recursion depth limited to 2 levels by default
> = [Iterations] extends [never]
  ? never
  : Required<
      OmitNeverKeys<{
        [P in keyof T]: OmitNeverArrays<ReplaceDistributive<T[P], Iterations>>;
      }>
    >;
