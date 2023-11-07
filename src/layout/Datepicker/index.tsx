import React from 'react';

import moment from 'moment';

import { addValidationToField, FrontendValidationSource, initializeValidationField } from 'src/features/validation';
import { DatepickerDef } from 'src/layout/Datepicker/config.def.generated';
import { DatepickerComponent } from 'src/layout/Datepicker/DatepickerComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { getDateConstraint, getDateFormat } from 'src/utils/dateHelpers';
import { formatISOString } from 'src/utils/formatDate';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { IFormData } from 'src/features/formData';
import type { FieldValidations } from 'src/features/validation/types';
import type { ComponentValidation, PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ISchemaValidationError } from 'src/utils/validation/schemaValidation';
import type { IValidationContext } from 'src/utils/validation/types';

export class Datepicker extends DatepickerDef implements ComponentValidation {
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
    { formData, langTools }: IValidationContext,
    overrideFormData?: IFormData,
  ): FieldValidations {
    const formDataToValidate = { ...formData, ...overrideFormData };
    const field = node.item.dataModelBindings?.simpleBinding;

    if (!field) {
      return {};
    }

    const data = formDataToValidate[field];

    const minDate = getDateConstraint(node.item.minDate, 'min');
    const maxDate = getDateConstraint(node.item.maxDate, 'max');
    const format = getDateFormat(node.item.format, langTools.selectedLanguage);

    const fieldValidations: FieldValidations = {};
    /**
     * Initialize validation group for field,
     * this must be done for all fields that will be validated
     * so we remove existing validations in case they are fixed.
     */
    initializeValidationField(fieldValidations, field, FrontendValidationSource.Component);

    const date = moment(data, moment.ISO_8601);

    if (!date.isValid()) {
      const message = langTools.langAsString('date_picker.invalid_date_message', [format]);
      addValidationToField(fieldValidations, {
        message,
        severity: 'errors',
        field,
        group: FrontendValidationSource.Component,
      });
    }

    if (date.isBefore(minDate)) {
      const message = langTools.langAsString('date_picker.min_date_exeeded');
      addValidationToField(fieldValidations, {
        message,
        severity: 'errors',
        field,
        group: FrontendValidationSource.Component,
      });
    } else if (date.isAfter(maxDate)) {
      const message = langTools.langAsString('date_picker.max_date_exeeded');
      addValidationToField(fieldValidations, {
        message,
        severity: 'errors',
        field,
        group: FrontendValidationSource.Component,
      });
    }

    return fieldValidations;
  }

  // Since the format is validated in component validations, it needs to be ignored in schema validation
  runSchemaValidation(node: LayoutNode<'Datepicker'>, schemaErrors: ISchemaValidationError[]): FieldValidations {
    const field = node.item.dataModelBindings?.simpleBinding;
    if (!field) {
      return {};
    }

    const fieldValidations: FieldValidations = {};

    /**
     * Initialize validation group for field,
     * this must be done for all fields that will be validated
     * so we remove existing validations in case they are fixed.
     */
    initializeValidationField(fieldValidations, field, FrontendValidationSource.Component);

    for (const error of schemaErrors) {
      if (field === error.bindingField && error.keyword !== 'format') {
        addValidationToField(fieldValidations, {
          message: error.message,
          severity: 'errors',
          field,
          group: FrontendValidationSource.Schema,
        });
      }
    }
    return fieldValidations;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Datepicker'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
