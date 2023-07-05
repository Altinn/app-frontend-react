import type {
  IDataModelBindingsSimple,
  ILayoutCompBase,
  ISelectionComponent,
  TextBindingsForLabel,
} from 'src/layout/layout';
import type { LayoutStyle } from 'src/types';

type ValidTexts = TextBindingsForLabel;
export type ILayoutCompRadioButtons = ILayoutCompBase<'RadioButtons', IDataModelBindingsSimple, ValidTexts> &
  ISelectionComponent & {
    layout?: LayoutStyle;
    showAsCard?: boolean;
  };
