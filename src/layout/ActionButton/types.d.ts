import type { IProcessAction } from 'src/features/process';
import type { ILayoutCompBase } from 'src/layout/layout';

export interface ILayoutCompActionButton extends ILayoutCompBase<'ActionButton'> {
  action: IProcessAction;
  buttonStyle: ActionButtonStyle;
}

export type ActionButtonStyle = 'primary' | 'secondary';
