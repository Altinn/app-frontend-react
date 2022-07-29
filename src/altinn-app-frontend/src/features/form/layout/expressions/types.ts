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

export interface ILayoutExpression {
  function: keyof typeof layoutExpressionFunctions;
  args: [ILayoutExpressionArg, ILayoutExpressionArg];
}
