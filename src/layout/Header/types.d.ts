import type { ILayoutCompBase } from 'src/layout/layout';

type ValidTexts = 'title' | 'help';
export interface ILayoutCompHeader extends ILayoutCompBase<'Header', undefined, ValidTexts> {
  size: 'L' | 'M' | 'S' | 'h2' | 'h3' | 'h4';
}
