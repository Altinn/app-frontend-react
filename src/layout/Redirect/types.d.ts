import type { ILayoutCompBase } from 'src/layout/layout';

export interface ILayoutCompRedirect extends ILayoutCompBase<'Redirect'> {
  style: RedirectStyle;
  openInNewTab?: boolean;
}

export type RedirectStyle = 'primary' | 'secondary' | 'link';
