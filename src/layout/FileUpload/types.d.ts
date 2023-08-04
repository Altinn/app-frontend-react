import type { ExprVal } from 'src/features/expressions/types';
import type { ComponentTypes, ILayoutCompBase } from 'src/layout/layout';

// PRIORITY: Remove
export interface ILayoutCompFileUploadBase<T extends Extract<ComponentTypes, 'FileUpload' | 'FileUploadWithTag'>>
  extends ILayoutCompBase<T> {
  maxFileSizeInMB: number;
  maxNumberOfAttachments: number;
  minNumberOfAttachments: number;
  displayMode: 'simple' | 'list';
  hasCustomFileEndings?: boolean;
  validFileEndings?: string[] | string;
  alertOnDelete?: ExprVal.Boolean;
}

// PRIORITY: Remove
export type ILayoutCompFileUpload = ILayoutCompFileUploadBase<'FileUpload'>;
