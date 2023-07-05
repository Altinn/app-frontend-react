import type { ILayoutCompBase } from 'src/layout/layout';
import type { IMapping } from 'src/types';

type ValidTexts = 'title';
export interface ILayoutCompInstantiationButton extends ILayoutCompBase<'InstantiationButton', undefined, ValidTexts> {
  mapping?: IMapping;
  busyWithId?: string;
}
