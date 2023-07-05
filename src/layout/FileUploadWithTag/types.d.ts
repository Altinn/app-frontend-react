import type { ILayoutCompFileUploadBase } from 'src/layout/FileUpload/types';
import type { TextBindingsForFormComponents, TextBindingsForLabel } from 'src/layout/layout';
import type { IMapping } from 'src/types';

type ValidTexts = TextBindingsForLabel | TextBindingsForFormComponents | 'tagTitle';
export interface ILayoutCompFileUploadWithTag extends ILayoutCompFileUploadBase<'FileUploadWithTag', ValidTexts> {
  optionsId: string;
  mapping?: IMapping;
}
