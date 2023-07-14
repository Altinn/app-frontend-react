import type { ILayoutCompBase, ILayoutCompWillBeSavedWhileTyping } from 'src/layout/layout';
import type { HTMLAutoCompleteValues } from 'src/types/shared';

export interface ILayoutCompTextArea extends ILayoutCompBase<'TextArea'>, ILayoutCompWillBeSavedWhileTyping {
  autocomplete?: HTMLAutoCompleteValues;
  maxLength?: number;
}
