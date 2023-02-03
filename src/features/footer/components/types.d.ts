import type { IFooterComponentType } from 'src/features/footer/types';

export interface IFooterGrid {
  xs?: number | [number, number];
  sm?: number | [number, number];
  md?: number | [number, number];
  lg?: number | [number, number];
  xl?: number | [number, number];
}

export interface IFooterComponent<T extends IFooterComponentType> {
  type: T;
  gridColumns?: IFooterGrid;
  gridRows?: IFooterGrid;
}
