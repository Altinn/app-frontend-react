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

export interface ILayoutExpressionComponentArg {
  component: string;
}

export type ILayoutExpressionArg =
  | string
  | boolean
  | number
  | ILayoutExpressionDataModelArg
  | ILayoutExpressionComponentArg;

export interface ILayoutExpression {
  function: keyof typeof layoutExpressionFunctions;
  args: [ILayoutExpressionArg, ILayoutExpressionArg];
}
