import { isAfter, isBefore } from 'date-fns';

import { getDateConstraint, getDateFormat, strictParseISO } from 'src/app-components/Datepicker/utils/dateHelpers';
import { FD } from 'src/features/formData/FormDataWrite';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { type ComponentValidation, FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { getDatepickerFormat } from 'src/utils/dateUtils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useDatepickerValidation(node: LayoutNode<'Datepicker'>): ComponentValidation[] {
  const currentLanguage = useCurrentLanguage();
  const field = NodesInternal.useNodeData(node, (data) => data.layout.dataModelBindings?.simpleBinding);
  const data = FD.useDebouncedPick(field);
  const minDate = getDateConstraint(
    NodesInternal.useNodeData(node, (data) => data.layout.minDate),
    'min',
  );
  const maxDate = getDateConstraint(
    NodesInternal.useNodeData(node, (data) => data.layout.maxDate),
    'max',
  );
  const format = getDateFormat(
    NodesInternal.useNodeData(node, (data) => data.layout.format),
    currentLanguage,
  );
  const dataAsString = typeof data === 'string' || typeof data === 'number' ? String(data) : undefined;
  if (!dataAsString) {
    return [];
  }

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
