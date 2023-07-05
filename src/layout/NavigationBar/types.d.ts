import type { ILayoutCompBase } from 'src/layout/layout';

type ValidTexts = undefined;
export interface ILayoutCompNavBar extends ILayoutCompBase<'NavigationBar', undefined, ValidTexts> {
  compact?: boolean;
}
