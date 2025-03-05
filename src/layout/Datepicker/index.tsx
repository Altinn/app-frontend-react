import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { formatISOString, getDateFormat } from 'src/app-components/Datepicker/utils/dateHelpers';
import { useDisplayData } from 'src/features/displayData/useDisplayData';
import { FrontendValidationSource } from 'src/features/validation';
import { DatepickerDef } from 'src/layout/Datepicker/config.def.generated';
import { DatepickerComponent } from 'src/layout/Datepicker/DatepickerComponent';
import { DatepickerSummary } from 'src/layout/Datepicker/DatepickerSummary';
import { useDatepickerValidation } from 'src/layout/Datepicker/useDatepickerValidation';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { BaseValidation, ComponentValidation } from 'src/features/validation';
import type {
  PropsFromGenericComponent,
  ValidateComponent,
  ValidationFilter,
  ValidationFilterFunction,
} from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeDataSelector } from 'src/utils/layout/NodesContext';

export class Datepicker extends DatepickerDef implements ValidateComponent<'Datepicker'>, ValidationFilter {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Datepicker'>>(
    function LayoutComponentDatepickerRender(props, _): JSX.Element | null {
      return <DatepickerComponent {...props} />;
    },
  );

  getDisplayData({ currentLanguage, formData, nodeId, nodeDataSelector }: DisplayDataProps<'Datepicker'>): string {
    const data = formData?.simpleBinding ?? '';
    if (!data) {
      return '';
    }

    const format = nodeDataSelector((picker) => picker(nodeId, 'Datepicker')?.item?.format, [nodeId]);
    const dateFormat = getDateFormat(format, currentLanguage);
    return formatISOString(data, dateFormat) ?? data;
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Datepicker'>): JSX.Element | null {
    const displayData = useDisplayData(targetNode);
    return (
      <SummaryItemSimple
        formDataAsString={displayData}
        hideFromVisualTesting={true}
      />
    );
  }

  renderSummary2(props: Summary2Props<'Datepicker'>): JSX.Element | null {
    return (
      <DatepickerSummary
        componentNode={props.target}
        isCompact={props.isCompact}
        emptyFieldText={props.override?.emptyFieldText}
      />
    );
  }

  useComponentValidation(node: LayoutNode<'Datepicker'>): ComponentValidation[] {
    return useDatepickerValidation(node);
  }

  /**
   * Datepicker has a custom format validation which give a better error message than what the schema provides.
   * Filter out the schema format vaildation to avoid duplicate error messages.
   */
  private static schemaFormatFilter(validation: BaseValidation): boolean {
    return !(
      validation.source === FrontendValidationSource.Schema && validation.message.key === 'validation_errors.pattern'
    );
  }

  /**
   * Avoid duplicate validation message.
   */
  private static schemaFormatMinimumFilter(validation: BaseValidation): boolean {
    return !(
      validation.source === FrontendValidationSource.Schema &&
      validation.message.key === 'validation_errors.formatMinimum'
    );
  }

  /**
   * Avoid duplicate validation message.
   */
  private static schemaFormatMaximumFilter(validation: BaseValidation): boolean {
    return !(
      validation.source === FrontendValidationSource.Schema &&
      validation.message.key === 'validation_errors.formatMaximum'
    );
  }

  getValidationFilters(node: LayoutNode<'Datepicker'>, selector: NodeDataSelector): ValidationFilterFunction[] {
    const filters = [Datepicker.schemaFormatFilter];

    if (selector((picker) => picker(node.id, 'Datepicker')?.item?.minDate, [node.id])) {
      filters.push(Datepicker.schemaFormatMinimumFilter);
    }

    if (selector((picker) => picker(node.id, 'Datepicker')?.item?.maxDate, [node.id])) {
      filters.push(Datepicker.schemaFormatMaximumFilter);
    }

    return filters;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Datepicker'>): string[] {
    const validation = this.validateDataModelBindingsAny(ctx, 'simpleBinding', ['string']);
    const [errors, result] = [validation[0] ?? [], validation[1]];

    if (result?.format === 'date-time' && ctx.item.timeStamp === false) {
      errors.push(
        `simpleBinding-datamodellbindingen peker på en streng med "format": "date-time", men komponenten har "timeStamp": false. Komponenten lagrer feil format i henhold til datamodellen.`,
      );
    }
    if (result?.format === 'date' && (ctx.item.timeStamp === undefined || ctx.item.timeStamp === true)) {
      errors.push(
        `simpleBinding-datamodellbindingen peker på en streng med "format": "date" men komponenten har "timeStamp": true${ctx.item.timeStamp ? '' : ' (default)'}. Komponenten lagrer feil format i henhold til datamodellen.`,
      );
    }

    return errors;
  }
}
