import type { IFooterComponent } from 'src/features/footer/components/types';

export interface IFooterPhoneComponent extends IFooterComponent<'Phone'> {
  title: string;
  target: string;
}
