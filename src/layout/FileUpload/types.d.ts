import type { ExprVal } from 'src/features/expressions/types';
import type { ComponentTypes, ILayoutCompBase } from 'src/layout/layout';
import type { IMapping } from 'src/types';

export interface ILayoutCompFileUploadBase<T extends Extract<ComponentTypes, 'FileUpload'>> extends ILayoutCompBase<T> {
  maxFileSizeInMB: number;
  maxNumberOfAttachments: number;
  minNumberOfAttachments: number;
  displayMode: 'simple' | 'list';
  hasCustomFileEndings?: boolean;
  validFileEndings?: string[] | string;
  alertOnDelete?: ExprVal.Boolean;
  optionsId?: string;
  mapping?: IMapping;
}

export type ILayoutCompFileUpload = ILayoutCompFileUploadBase<'FileUpload'>;
