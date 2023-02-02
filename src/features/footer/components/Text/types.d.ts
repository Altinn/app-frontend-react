import type { IFooterComponent } from 'src/features/footer/components/types';

export interface IFooterTextComponent extends IFooterComponent<'Text'> {
  title: string;
}
