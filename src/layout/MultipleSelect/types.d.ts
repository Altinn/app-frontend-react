import type {
  IDataModelBindingsSimple,
  ILayoutCompBase,
  ISelectionComponent,
  TextBindingsForFormComponents,
  TextBindingsForLabel,
} from 'src/layout/layout';

type ValidTexts = TextBindingsForLabel | TextBindingsForFormComponents;
export type ILayoutCompMultipleSelect = ILayoutCompBase<'MultipleSelect', IDataModelBindingsSimple, ValidTexts> &
  ISelectionComponent;
