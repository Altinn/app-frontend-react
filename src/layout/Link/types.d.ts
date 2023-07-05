import type { ILayoutCompBase } from 'src/layout/layout';

type ValidTexts = 'target' | 'title';
export interface ILayoutCompLink extends ILayoutCompBase<'Link', undefined, ValidTexts> {
  style: LinkStyle;
  openInNewTab?: boolean;
}

export type LinkStyle = 'primary' | 'secondary' | 'link';
