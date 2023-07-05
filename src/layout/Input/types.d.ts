import type {
  IDataModelBindingsSimple,
  IInputFormatting,
  ILayoutCompBase,
  ILayoutCompWillBeSavedWhileTyping,
  TextBindingsForFormComponents,
  TextBindingsForLabel,
} from 'src/layout/layout';
import type { HTMLAutoCompleteValues } from 'src/types/shared';

type ValidTexts = TextBindingsForLabel | TextBindingsForFormComponents;
export interface ILayoutCompInput
  extends ILayoutCompBase<'Input', IDataModelBindingsSimple, ValidTexts>,
    ILayoutCompWillBeSavedWhileTyping {
  formatting?: IInputFormatting;
  variant?: 'text' | 'search';
  autocomplete?: HTMLAutoCompleteValues;
}
