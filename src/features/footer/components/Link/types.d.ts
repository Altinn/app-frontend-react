import type { IFooterComponent } from 'src/features/footer/components/types';

export interface IFooterLinkComponent extends IFooterComponent<'Link'> {
  title: string;
  target: string;
  icon?: IFooterIcon;
}
