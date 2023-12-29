import type { ExprVal, ExprValToActualOrExpr } from 'src/features/expressions/types';

export interface ILayoutSets {
  sets: ILayoutSet[];
  uiSettings?: Omit<IPagesSettings, 'order'>;
}

export interface ILayoutSet {
  id: string;
  dataType: string;
  tasks?: string[];
}

export interface ILayoutSettings {
  pages: IPagesSettings;
  components?: IComponentsSettings;
  hideCloseButton?: boolean;
  showLanguageSelector?: boolean;
  showExpandWidthButton?: boolean;
  showProgress?: boolean;
  receiptLayoutName?: string;
}

export interface IPagesSettings {
  order: string[];
  hideCloseButton?: boolean;
  showProgress?: boolean;
  showLanguageSelector?: boolean;
  showExpandWidthButton?: boolean;
  excludeFromPdf?: string[];
  pdfLayoutName?: string;
  autoSaveBehavior?: 'onChangePage' | 'onChangeFormData';
}

export interface IComponentsSettings {
  excludeFromPdf?: string[];
}

export interface IRules {
  [id: string]: () => Record<string, string>;
}

export type RuleFunc<T extends Record<string, any>> = (argObject: T) => T;

export interface IRuleObject {
  [id: string]: RuleFunc<any>;
}

export interface ISimpleInstance {
  id: string;
  lastChanged: string;
  lastChangedBy: string;
}

export interface IHiddenLayoutsExternal {
  [layoutKey: string]: ExprValToActualOrExpr<ExprVal.Boolean> | undefined;
}

export enum ProcessTaskType {
  Unknown = 'unknown',
  Data = 'data',
  Archived = 'ended',
  Confirm = 'confirmation',
  Feedback = 'feedback',
}

export enum PresentationType {
  Stateless = 'stateless',
}

export enum DateFlags {
  Today = 'today',
}

/**
 * This function can be used to have TypeScript enforce that we never reach the code branch in question
 * @see https://stackoverflow.com/a/39419171
 */
export function assertUnreachable<Ret = never>(_x: never, execute?: () => Ret): Ret {
  if (execute) {
    return execute();
  }
  throw new Error('Reached unreachable code');
}
