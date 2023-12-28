import type { ExprVal, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { IComponentScrollPos } from 'src/features/form/layout/formLayoutTypes';
import type { RootState } from 'src/redux/store';

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

export interface IRepeatingGroup {
  // index: number;
  // baseGroupId?: string;
  // dataModelBinding?: string;
  editIndex: number;
  deletingIndex: number[];
  multiPageIndex: number;
}

export interface IRepeatingGroups {
  [id: string]: IRepeatingGroup;
}

export interface IRules {
  [id: string]: () => Record<string, string>;
}

export type RuleFunc<T extends Record<string, any>> = (argObject: T) => T;

export interface IRuleObject {
  [id: string]: RuleFunc<any>;
}

export type IRuntimeState = RootState;
export type IRuntimeStore = IRuntimeState;

export interface ISimpleInstance {
  id: string;
  lastChanged: string;
  lastChangedBy: string;
}

export interface IHiddenLayoutsExternal {
  [layoutKey: string]: ExprValToActualOrExpr<ExprVal.Boolean> | undefined;
}

export interface IUiConfig {
  autoSaveBehavior?: 'onChangePage' | 'onChangeFormData';
  receiptLayoutName?: string;
  returnToView?: string;
  focus: string | null | undefined;
  hiddenFields: string[];
  excludePageFromPdf: string[] | null;
  excludeComponentFromPdf: string[] | null;
  pdfLayoutName?: string;
  keepScrollPos?: IComponentScrollPos;
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
