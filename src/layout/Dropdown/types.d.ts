import type {
  IDataModelBindingsSimple,
  ILayoutCompBase,
  ISelectionComponent,
  TextBindingsForFormComponents,
  TextBindingsForLabel,
} from 'src/layout/layout';

type ValidTexts = TextBindingsForLabel | TextBindingsForFormComponents;
export type ILayoutCompDropdown = ILayoutCompBase<'Dropdown', IDataModelBindingsSimple, ValidTexts> &
  ISelectionComponent;
