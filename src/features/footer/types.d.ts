import type { IFooterComponent } from 'src/features/footer/components/types';

export type IFooterComponentType = 'Email' | 'Link' | 'Phone' | 'Text';
export type IFooterIcon = 'information' | 'email' | 'phone';

interface IFooterLayout {
  footer: IFooterComponent<IFooterComponentType>[];
}
