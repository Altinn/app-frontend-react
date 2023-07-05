import type {
  IDataModelBindingsSimple,
  ILayoutCompBase,
  ISelectionComponent,
  TextBindingsForFormComponents,
  TextBindingsForLabel,
} from 'src/layout/layout';
import type { LayoutStyle } from 'src/types';

type ValidTexts = TextBindingsForLabel | TextBindingsForFormComponents;
export type ILayoutCompCheckboxes = ILayoutCompBase<'Checkboxes', IDataModelBindingsSimple, ValidTexts> &
  ISelectionComponent & {
    layout?: LayoutStyle;
  };
