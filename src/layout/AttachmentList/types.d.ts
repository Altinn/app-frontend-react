import type { ILayoutCompBase } from 'src/layout/layout';

type ValidTexts = 'title';
export interface ILayoutCompAttachmentList extends ILayoutCompBase<'AttachmentList', undefined, ValidTexts> {
  dataTypeIds?: string[];
  includePDF?: boolean;
}
