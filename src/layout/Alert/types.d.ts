import type { ILayoutCompBase } from 'src/layout/layout';

export interface ILayoutCompAlertBase {
  severity: 'success' | 'warning' | 'danger' | 'info';
  useAsAlert?: boolean;
}

export type ILayoutCompAlert = ILayoutCompBase<'Alert'> & ILayoutCompAlertBase;
