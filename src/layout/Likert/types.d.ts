import type {
  IDataModelBindingsSimple,
  ILayoutCompBase,
  ISelectionComponent,
  TextBindingsForLabel,
} from 'src/layout/layout';
import type { LayoutStyle } from 'src/types';

// TODO: description/help only works on mobile, as it uses the ControlledRadioGroup component
// Ideally, it should be possible to use it on desktop as well, or the mobile mode should also not display
// anything here. Fixing this requires some refactoring.
type ValidTexts = TextBindingsForLabel;
export type ILayoutCompLikert = ILayoutCompBase<'Likert', IDataModelBindingsSimple, ValidTexts> &
  ISelectionComponent & {
    layout?: LayoutStyle;
    showAsCard?: boolean;
  };
