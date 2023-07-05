import type { ILayoutCompBase } from 'src/layout/layout';
import type { IActionType } from 'src/types/shared';

type ValidTexts = 'title';
export interface ILayoutCompActionButton extends ILayoutCompBase<'ActionButton', undefined, ValidTexts> {
  action: IActionType;
  buttonStyle: ActionButtonStyle;
}

export type ActionButtonStyle = 'primary' | 'secondary';
