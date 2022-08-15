import type { layoutExpressionFunctions } from 'src/features/form/layout/expressions';

type RealFunctions = typeof layoutExpressionFunctions;
export type LayoutExpressionFunction =
  | keyof RealFunctions
  | keyof ILayoutExpressionLookupFunctions;

export interface ILayoutExpressionLookupFunctions {
  dataModel: (path: string) => string;
  component: (baseComponentId: string) => string;
  instanceContext: (prop: string) => string;
  applicationSettings: (prop: string) => string;
}

export type BaseValue = 'string' | 'number' | 'boolean';
export type BaseToActual<T extends BaseValue> = T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : never;

type ArgsToActual<T extends BaseValue[]> = {
  [Index in keyof T]: BaseToActual<T[Index]>;
};

export interface FuncDef<Args extends BaseValue[], Ret extends BaseValue> {
  impl: (...params: ArgsToActual<Args>) => BaseToActual<Ret>;
  args: Args;
  returns: Ret;
}

type ArgsFor<F extends LayoutExpressionFunction> =
  F extends keyof ILayoutExpressionLookupFunctions
    ? ['string']
    : F extends keyof RealFunctions
    ? RealFunctions[F]['args']
    : never;

type RealFunctionsReturning<T extends BaseValue> = Extract<
  RealFunctions,
  { returns: T }
>;

type FunctionsReturning<T extends BaseValue> = T extends 'string'
  ? ILayoutExpression<
      keyof ILayoutExpressionLookupFunctions | RealFunctionsReturning<'string'>
    >
  : RealFunctionsReturning<T>;

type MaybeRecursive<Args extends BaseValue[]> = {
  [Index in keyof Args]:
    | BaseToActual<Args[Index]>
    | FunctionsReturning<Args[Index]>;
};

export interface ILayoutExpression<
  F extends LayoutExpressionFunction = LayoutExpressionFunction,
> {
  function: F;
  args: MaybeRecursive<ArgsFor<F>>;
}
