import React from 'react';

import { DatepickerComponent } from 'src/layout/Datepicker/DatepickerComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { getDateFormat } from 'src/utils/dateHelpers';
import { formatISOString } from 'src/utils/formatDate';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Datepicker extends FormComponent<'Datepicker'> {
  render(props: PropsFromGenericComponent<'Datepicker'>): JSX.Element | null {
    return <DatepickerComponent {...props} />;
  }

  getDisplayData({ targetNode, lookups }: SummaryRendererProps<'Datepicker'>): string {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const dateFormat = getDateFormat(targetNode.item.format);
    const data = lookups.formData[targetNode.item.dataModelBindings?.simpleBinding] || '';
    return formatISOString(data, dateFormat) ?? data;
  }

  renderSummary(_props: SummaryRendererProps<'Datepicker'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Nothing implemented yet</span>;
  }
}
