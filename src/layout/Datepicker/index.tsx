import React from 'react';

import moment from 'moment';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { staticUseLanguageFromState, useLanguage } from 'src/hooks/useLanguage';
import { DatepickerComponent } from 'src/layout/Datepicker/DatepickerComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
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
    const { selectedLanguage } = useLanguage();
    if (!node.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const dateFormat = getDateFormat(node.item.format, selectedLanguage);
    const data = formData[node.item.dataModelBindings?.simpleBinding] || '';
    return formatISOString(data, dateFormat) ?? data;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Datepicker'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return (
      <SummaryItemSimple
        formDataAsString={displayData}
        hideFromVisualTesting={true}
      />
    );
  }

  runComponentValidations(node: LayoutNodeFromType<'Datepicker'>): IValidationObject[] {
    if (node.isHidden() || node.item.renderAsSummary) {
      return [];
    }

    const state: IRuntimeState = window.reduxStore.getState();
    const { langAsString, selectedLanguage } = staticUseLanguageFromState(state);
    const formData = node.getFormData().simpleBinding;

    if (!formData) {
      return [];
    }

    const minDate = getDateConstraint(node.item.minDate, 'min');
    const maxDate = getDateConstraint(node.item.maxDate, 'max');
    const format = getDateFormat(node.item.format, selectedLanguage);

    const validations: IValidationObject[] = [];
    const date = moment(formData, moment.ISO_8601);

    if (!date.isValid()) {
      validations.push(
        buildValidationObject(node, 'errors', langAsString('date_picker.invalid_date_message', [format])),
      );
    }

    if (date.isBefore(minDate)) {
      validations.push(buildValidationObject(node, 'errors', langAsString('date_picker.min_date_exeeded')));
    } else if (date.isAfter(maxDate)) {
      validations.push(buildValidationObject(node, 'errors', langAsString('date_picker.max_date_exeeded')));
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
