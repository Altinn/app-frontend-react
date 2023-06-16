import React from 'react';

import moment from 'moment';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { getLanguageFromKey, getParsedLanguageFromKey } from 'src/language/sharedLanguage';
import { DatepickerComponent } from 'src/layout/Datepicker/DatepickerComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { appLanguageStateSelector } from 'src/selectors/appLanguageStateSelector';
import { getDateConstraint, getDateFormat } from 'src/utils/dateHelpers';
import { formatISOString } from 'src/utils/formatDate';
import { buildValidationObject } from 'src/utils/validation/validationHelpers';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompDatepicker } from 'src/layout/Datepicker/types';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { IRuntimeState } from 'src/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationObject } from 'src/utils/validation/types';

export class Datepicker extends FormComponent<'Datepicker'> {
  render(props: PropsFromGenericComponent<'Datepicker'>): JSX.Element | null {
    return <DatepickerComponent {...props} />;
  }

  useDisplayData(node: LayoutNodeFromType<'Datepicker'>): string {
    const formData = useAppSelector((state) => state.formData.formData);
    const language = useAppSelector(appLanguageStateSelector);
    if (!node.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const dateFormat = getDateFormat(node.item.format, language);
    const data = formData[node.item.dataModelBindings?.simpleBinding] || '';
    return formatISOString(data, dateFormat) ?? data;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Datepicker'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }

  runComponentValidations(node: LayoutNodeFromType<'Datepicker'>): IValidationObject[] {
    if (node.isHidden()) {
      return [];
    }

    const state: IRuntimeState = window.reduxStore.getState();
    const profileLanguage = appLanguageStateSelector(state);
    const language = state.language.language ?? {};
    const formData = node.getFormData().simpleBinding;

    if (!formData) {
      return [];
    }

    const minDate = getDateConstraint(node.item.minDate, 'min');
    const maxDate = getDateConstraint(node.item.maxDate, 'max');
    const format = getDateFormat(node.item.format, profileLanguage);

    const validations: IValidationObject[] = [];
    const date = moment(formData, moment.ISO_8601);

    if (!date.isValid()) {
      validations.push(
        buildValidationObject(
          node,
          'errors',
          getParsedLanguageFromKey('date_picker.invalid_date_message', language, [format], true),
        ),
      );
    }

    if (date.isBefore(minDate)) {
      validations.push(
        buildValidationObject(node, 'errors', getLanguageFromKey('date_picker.min_date_exeeded', language)),
      );
    } else if (date.isAfter(maxDate)) {
      validations.push(
        buildValidationObject(node, 'errors', getLanguageFromKey('date_picker.max_date_exeeded', language)),
      );
    }

    return validations;
  }
}

export const Config = {
  def: new Datepicker(),
};

export type TypeConfig = {
  layout: ILayoutCompDatepicker;
  nodeItem: ExprResolved<ILayoutCompDatepicker>;
  nodeObj: LayoutNode;
};
