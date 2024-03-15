import React, { forwardRef } from 'react';

import dot from 'dot-object';
import moment from 'moment';

import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { DatepickerDef } from 'src/layout/Datepicker/config.def.generated';
import { DatepickerComponent } from 'src/layout/Datepicker/DatepickerComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { getDateConstraint, getDateFormat } from 'src/utils/dateHelpers';
import { formatISOString } from 'src/utils/formatDate';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { BaseValidation, ComponentValidation, ValidationDataSources } from 'src/features/validation';
import type {
  PropsFromGenericComponent,
  ValidateComponent,
  ValidationFilter,
  ValidationFilterFunction,
} from 'src/layout';
import type { CompDatepickerInternal } from 'src/layout/Datepicker/config.generated';
import type { CompInternal } from 'src/layout/layout';
import type { ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Datepicker extends DatepickerDef implements ValidateComponent<'Datepicker'>, ValidationFilter {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Datepicker'>>(
    function LayoutComponentDatepickerRender(props, _): JSX.Element | null {
      return <DatepickerComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'Datepicker'>): CompInternal<'Datepicker'> {
    return {
      ...item,
      ...evalCommon(item),
      ...evalTrb(item),
    };
  }

  getDisplayData(
    node: LayoutNode<'Datepicker'>,
    item: CompDatepickerInternal,
    { currentLanguage, formDataSelector }: DisplayDataProps,
  ): string {
    if (!item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const dateFormat = getDateFormat(item.format, currentLanguage);
    const data = node.getFormData(formDataSelector).simpleBinding ?? '';
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
    item: CompDatepickerInternal,
    { formData, currentLanguage }: ValidationDataSources,
  ): ComponentValidation[] {
    const field = item.dataModelBindings?.simpleBinding;
    const data = field ? dot.pick(field, formData) : undefined;
    const dataAsString = typeof data === 'string' || typeof data === 'number' ? String(data) : undefined;

    if (!dataAsString) {
      return [];
    }

    const minDate = getDateConstraint(item.minDate, 'min');
    const maxDate = getDateConstraint(item.maxDate, 'max');
    const format = getDateFormat(item.format, currentLanguage);

    const validations: ComponentValidation[] = [];

    const date = moment(dataAsString, moment.ISO_8601);

    if (!date.isValid()) {
      validations.push({
        message: { key: 'date_picker.invalid_date_message', params: [format] },
        severity: 'error',
        componentId: node.getId(),
        source: FrontendValidationSource.Component,
        category: ValidationMask.Component,
      });
    }

    if (date.isBefore(minDate)) {
      validations.push({
        message: { key: 'date_picker.min_date_exeeded' },
        severity: 'error',
        componentId: node.getId(),
        source: FrontendValidationSource.Component,
        category: ValidationMask.Component,
      });
    } else if (date.isAfter(maxDate)) {
      validations.push({
        message: { key: 'date_picker.max_date_exeeded' },
        severity: 'error',
        componentId: node.getId(),
        source: FrontendValidationSource.Component,
        category: ValidationMask.Component,
      });
    }

    return validations;
  }

  /**
   * Datepicker has a custom format validation which give a better error message than what the schema provides.
   * Filter out the schema format vaildation to avoid duplicate error messages.
   */
  private schemaFormatFilter(validation: BaseValidation): boolean {
    return !(
      validation.source === FrontendValidationSource.Schema && validation.message.key === 'validation_errors.pattern'
    );
  }

  getValidationFilters(_node: LayoutNode): ValidationFilterFunction[] {
    return [this.schemaFormatFilter];
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Datepicker'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
