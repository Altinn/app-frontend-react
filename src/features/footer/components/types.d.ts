import type { IFooterComponentType } from 'src/features/footer/types';

export interface IFooterComponent<T extends IFooterComponentType> {
  type: T;
}
