import type { IFooterComponent } from 'src/features/footer/components/types';

export type IFooterComponentType = 'Email' | 'Link' | 'Phone' | 'Text';
export type IFooterIcon = 'information' | 'email' | 'phone';

export interface IFooterColumns {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

interface IFooterLayout {
  columns: IFooterColumns;
  footer: IFooterComponent<IFooterComponentType>[];
}
