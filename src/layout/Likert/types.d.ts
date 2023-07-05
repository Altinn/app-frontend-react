import type {
  IDataModelBindingsSimple,
  ILayoutCompBase,
  ISelectionComponent,
  TextBindingsForLabel,
} from 'src/layout/layout';
import type { LayoutStyle } from 'src/types';

type ValidTexts = TextBindingsForLabel; // TODO: Test what happens with description/helpText
export type ILayoutCompLikert = ILayoutCompBase<'Likert', IDataModelBindingsSimple, ValidTexts> &
  ISelectionComponent & {
    layout?: LayoutStyle;
    showAsCard?: boolean;
  };
