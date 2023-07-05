import type { ILayoutCompBase } from 'src/layout/layout';

type ValidTexts = 'back' | 'next';
export interface ILayoutCompNavButtons extends ILayoutCompBase<'NavigationButtons', undefined, ValidTexts> {
  showBackButton?: boolean;
}
