import React from 'react';

import { CheckboxContainerComponent } from 'src/layout/Checkboxes/CheckboxesContainerComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { commaSeparatedToSummaryValues } from 'src/utils/formComponentUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Checkboxes extends FormComponent<'Checkboxes'> {
  render(props: PropsFromGenericComponent<'Checkboxes'>): JSX.Element | null {
    return <CheckboxContainerComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  getDisplayData({ targetNode, lookups }: SummaryRendererProps<'Checkboxes'>): { [key: string]: string } {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return {};
    }

    const value = lookups.formData[targetNode.item.dataModelBindings.simpleBinding] || '';
    return commaSeparatedToSummaryValues(targetNode.item, value, lookups);
  }

  renderSummary(_props: SummaryRendererProps<'Checkboxes'>): JSX.Element | null {
    return <span>Not implemented</span>;
  }
}
