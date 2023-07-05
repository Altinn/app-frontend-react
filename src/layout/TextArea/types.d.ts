import type {
  IDataModelBindingsSimple,
  ILayoutCompBase,
  ILayoutCompWillBeSavedWhileTyping,
  TextBindingsForFormComponents,
  TextBindingsForLabel,
} from 'src/layout/layout';
import type { HTMLAutoCompleteValues } from 'src/types/shared';

type ValidTexts = TextBindingsForLabel | TextBindingsForFormComponents;
export type ILayoutCompTextArea = ILayoutCompBase<'TextArea', IDataModelBindingsSimple, ValidTexts> &
  ILayoutCompWillBeSavedWhileTyping & { autocomplete?: HTMLAutoCompleteValues };
