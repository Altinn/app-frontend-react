import type { layoutExpressionFunctions } from 'src/features/form/layout/expressions/functions';

export type LayoutExpressionFunction = keyof typeof layoutExpressionFunctions;

export interface ILayoutExpressionAlias {
  [key: string]: RegExp;
}

export type ILayoutExpressionAliases = {
  [key in LayoutExpressionFunction]: ILayoutExpressionAlias[];
};

export interface ILayoutExpressionDataModelArg {
  dataModel: string;
}

export interface ILayoutExpressionInstanceContextArg {
  instanceContext: string;
}

export interface ILayoutExpressionApplicationSettingsArg {
  applicationSettings: string;
}

export interface ILayoutExpressionComponentArg {
  component: string;
}

export type ILayoutExpressionArg =
  | string
  | boolean
  | number
  | undefined
  | null
  | ILayoutExpressionDataModelArg
  | ILayoutExpressionComponentArg
  | ILayoutExpressionInstanceContextArg
  | ILayoutExpressionApplicationSettingsArg;

type MapToArg<T extends any[]> = T extends [any, any]
  ? [ILayoutExpressionArg, ILayoutExpressionArg]
  : T extends [any]
  ? [ILayoutExpressionArg]
  : ILayoutExpressionArg[];

export interface ILayoutExpression<
  F extends LayoutExpressionFunction = LayoutExpressionFunction,
> {
  function: F;
  args: MapToArg<Parameters<typeof layoutExpressionFunctions[F]>>;
}

export interface ILayoutExpressionRunnerLookups {
  dataModel: (path: string) => string;
  component: (baseComponentId: string) => string;
  instanceContext: (prop: string) => string;
  applicationSettings: (prop: string) => string;
}
