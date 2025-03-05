import { isAfter, isBefore } from 'date-fns';

import { getDateConstraint, getDateFormat, strictParseISO } from 'src/app-components/Datepicker/utils/dateHelpers';
import { type ComponentValidation, FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { getDatepickerFormat } from 'src/utils/formatDateLocale';
import { GeneratorData } from 'src/utils/layout/generator/GeneratorDataSources';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useDatepickerValidation(node: LayoutNode<'Datepicker'>): ComponentValidation[] {
  const { nodeDataSelector, formDataSelector, currentLanguage } = GeneratorData.useValidationDataSources();
  const field = nodeDataSelector(
    (picker) => picker(node.id, 'Datepicker')?.layout.dataModelBindings?.simpleBinding,
    [node.id],
  );
  const data = field ? formDataSelector(field) : undefined;
  const dataAsString = typeof data === 'string' || typeof data === 'number' ? String(data) : undefined;
  if (!dataAsString) {
    return [];
  }

  const minDate = getDateConstraint(
    nodeDataSelector((picker) => picker(node.id, 'Datepicker')?.item?.minDate, [node.id]),
    'min',
  );
  const maxDate = getDateConstraint(
    nodeDataSelector((picker) => picker(node.id, 'Datepicker')?.item?.maxDate, [node.id]),
    'max',
  );
  const format = getDateFormat(
    nodeDataSelector((picker) => picker(node.id, 'Datepicker')?.item?.format, [node.id]),
    currentLanguage,
  );
  const datePickerFormat = getDatepickerFormat(format).toUpperCase();

  const validations: ComponentValidation[] = [];
  const date = strictParseISO(dataAsString);
  if (!date) {
    validations.push({
      message: { key: 'date_picker.invalid_date_message', params: [datePickerFormat] },
      severity: 'error',
      source: FrontendValidationSource.Component,
      category: ValidationMask.Component,
    });
  }

  if (date && isBefore(date, minDate)) {
    validations.push({
      message: { key: 'date_picker.min_date_exeeded' },
      severity: 'error',
      source: FrontendValidationSource.Component,
      category: ValidationMask.Component,
    });
  } else if (date && isAfter(date, maxDate)) {
    validations.push({
      message: { key: 'date_picker.max_date_exeeded' },
      severity: 'error',
      source: FrontendValidationSource.Component,
      category: ValidationMask.Component,
    });
  }

  return validations;
}
