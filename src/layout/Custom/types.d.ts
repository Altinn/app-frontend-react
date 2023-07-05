import type { ILayoutCompBase } from 'src/layout/layout';

type ValidTexts = 'title';
export interface ILayoutCompCustom extends ILayoutCompBase<'Custom', undefined, ValidTexts> {
  tagName: string;
}
