import type { ILayoutCompFileUploadBase } from 'src/layout/FileUpload/types';
import type { IMapping } from 'src/types';

// PRIORITY: Remove
export interface ILayoutCompFileUploadWithTag extends ILayoutCompFileUploadBase<'FileUploadWithTag'> {
  optionsId: string;
  mapping?: IMapping;
}
