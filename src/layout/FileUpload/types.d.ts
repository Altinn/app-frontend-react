import type { ExprVal } from 'src/features/expressions/types';
import type {
  ComponentTypes,
  IDataModelBindingsList,
  IDataModelBindingsSimple,
  ILayoutCompBase,
  TextBindingsForFormComponents,
  TextBindingsForLabel,
} from 'src/layout/layout';

export interface ILayoutCompFileUploadBase<
  T extends Extract<ComponentTypes, 'FileUpload' | 'FileUploadWithTag'>,
  Texts extends string | undefined,
> extends ILayoutCompBase<T, IDataModelBindingsList | IDataModelBindingsSimple, Texts> {
  maxFileSizeInMB: number;
  maxNumberOfAttachments: number;
  minNumberOfAttachments: number;
  displayMode: 'simple' | 'list';
  hasCustomFileEndings?: boolean;
  validFileEndings?: string[] | string;
  alertOnDelete?: ExprVal.Boolean;
}

type ValidTexts = TextBindingsForLabel | TextBindingsForFormComponents;
export type ILayoutCompFileUpload = ILayoutCompFileUploadBase<'FileUpload', ValidTexts>;
