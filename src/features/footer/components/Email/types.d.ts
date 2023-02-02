import type { IFooterComponent } from 'src/features/footer/components/types';

export interface IFooterEmailComponent extends IFooterComponent<'Email'> {
  title: string;
  target: string;
}
