import type { IDataModelBindingsSimple, ILayoutCompBase, TextBindingsForLabel } from 'src/layout/layout';

type ValidTexts = TextBindingsForLabel;
export interface ILayoutCompDatepicker extends ILayoutCompBase<'Datepicker', IDataModelBindingsSimple, ValidTexts> {
  minDate?: string | 'today';
  maxDate?: string | 'today';
  timeStamp?: boolean;
  format?: string;
}
