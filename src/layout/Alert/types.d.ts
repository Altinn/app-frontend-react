import type { ILayoutCompBase } from 'src/layout/layout';

export type AlertSeverity = 'success' | 'warning' | 'danger' | 'info';

export interface ILayoutCompAlertBase {
  severity: AlertSeverity;
  useAsAlert?: boolean;
}

export type ILayoutCompAlert = ILayoutCompBase<'Alert'> & ILayoutCompAlertBase;
