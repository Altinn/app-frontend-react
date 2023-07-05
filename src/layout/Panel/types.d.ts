import type { ILayoutCompBase } from 'src/layout/layout';

export interface ILayoutCompPanelBase {
  variant?: 'info' | 'warning' | 'error' | 'success';
  showIcon?: boolean;
}

type ValidTexts = 'title' | 'body';
export type ILayoutCompPanel = ILayoutCompBase<'Panel', undefined, ValidTexts> & ILayoutCompPanelBase;
