import React from 'react';

import { FormComponent } from 'src/layout/LayoutComponent';
import { RadioButtonContainerComponent } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';
import { selectedValueToSummaryText } from 'src/utils/formComponentUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class RadioButtons extends FormComponent<'RadioButtons'> {
  render(props: PropsFromGenericComponent<'RadioButtons'>): JSX.Element | null {
    return <RadioButtonContainerComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  getDisplayData({ targetNode, lookups }: SummaryRendererProps<'RadioButtons'>): string {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const value = lookups.formData[targetNode.item.dataModelBindings.simpleBinding] || '';
    return selectedValueToSummaryText(targetNode.item, value, lookups) || '';
  }

  renderSummary(_props: SummaryRendererProps<'RadioButtons'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Nothing implemented yet</span>;
  }
}
