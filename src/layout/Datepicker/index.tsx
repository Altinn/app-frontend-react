import React from 'react';

import moment from 'moment';

import { FrontendValidationSource, ValidationUrgency } from 'src/features/validation';
import { DatepickerDef } from 'src/layout/Datepicker/config.def.generated';
import { DatepickerComponent } from 'src/layout/Datepicker/DatepickerComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { getDateConstraint, getDateFormat } from 'src/utils/dateHelpers';
import { formatISOString } from 'src/utils/formatDate';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { IFormData } from 'src/features/formData';
import type {
  ComponentValidation,
  FieldValidation,
  ISchemaValidationError,
  IValidationContext,
} from 'src/features/validation';
import type { PropsFromGenericComponent, ValidateComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Datepicker extends DatepickerDef implements ValidateComponent {
  render(props: PropsFromGenericComponent<'Datepicker'>): JSX.Element | null {
    return <DatepickerComponent {...props} />;
  }

  getDisplayData(node: LayoutNode<'Datepicker'>, { formData, langTools }): string {
    const { selectedLanguage } = langTools;
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

  runComponentValidation(
    node: LayoutNode<'Datepicker'>,
    { formData, langTools, currentLanguage }: IValidationContext,
    overrideFormData?: IFormData,
  ): ComponentValidation[] {
    const formDataToValidate = { ...formData, ...overrideFormData };
    const field = node.item.dataModelBindings?.simpleBinding;
    const data = field ? formDataToValidate[field] : undefined;

    if (!data) {
      return [];
    }

    const minDate = getDateConstraint(node.item.minDate, 'min');
    const maxDate = getDateConstraint(node.item.maxDate, 'max');
    const format = getDateFormat(node.item.format, currentLanguage);

    const validations: ComponentValidation[] = [];

    const date = moment(data, moment.ISO_8601);

    if (!date.isValid()) {
      const message = langTools.langAsString('date_picker.invalid_date_message', [format]);
      validations.push({
        message,
        severity: 'errors',
        componentId: node.item.id,
        group: FrontendValidationSource.Component,
        urgency: ValidationUrgency.OnGroupClose,
      });
    }

    if (date.isBefore(minDate)) {
      const message = langTools.langAsString('date_picker.min_date_exeeded');
      validations.push({
        message,
        severity: 'errors',
        componentId: node.item.id,
        group: FrontendValidationSource.Component,
        urgency: ValidationUrgency.Immediate,
      });
    } else if (date.isAfter(maxDate)) {
      const message = langTools.langAsString('date_picker.max_date_exeeded');
      validations.push({
        message,
        severity: 'errors',
        componentId: node.item.id,
        group: FrontendValidationSource.Component,
        urgency: ValidationUrgency.Immediate,
      });
    }

    return validations;
  }

  // Since the format is validated in component validations, it needs to be ignored in schema validation
  runSchemaValidation(node: LayoutNode<'Datepicker'>, schemaErrors: ISchemaValidationError[]): FieldValidation[] {
    const field = node.item.dataModelBindings?.simpleBinding;
    if (!field) {
      return [];
    }

    const validations: FieldValidation[] = [];

    for (const error of schemaErrors) {
      if (field === error.bindingField && error.keyword !== 'format') {
        validations.push({
          message: error.message,
          severity: 'errors',
          field,
          group: FrontendValidationSource.Schema,
          urgency: ValidationUrgency.Immediate,
        });
      }
    }
    return validations;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Datepicker'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
