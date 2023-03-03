import React from 'react';

import { FormComponent } from 'src/layout/LayoutComponent';
import { MultipleSelectComponent } from 'src/layout/MultipleSelect/MultipleSelectComponent';
import { commaSeparatedToSummaryValues } from 'src/utils/formComponentUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class MultipleSelect extends FormComponent<'MultipleSelect'> {
  render(props: PropsFromGenericComponent<'MultipleSelect'>): JSX.Element | null {
    return <MultipleSelectComponent {...props} />;
  }

  getDisplayData({ targetNode, lookups }: SummaryRendererProps<'MultipleSelect'>): { [key: string]: string } {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return {};
    }

    const value = lookups.formData[targetNode.item.dataModelBindings.simpleBinding] || '';
    return commaSeparatedToSummaryValues(targetNode.item, value, lookups);
  }

  renderSummary(_props: SummaryRendererProps<'MultipleSelect'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Nothing implemented yet</span>;
  }
}
