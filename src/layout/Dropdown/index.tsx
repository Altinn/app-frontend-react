import React from 'react';

import { DropdownComponent } from 'src/layout/Dropdown/DropdownComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { selectedValueToSummaryText } from 'src/utils/formComponentUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Dropdown extends FormComponent<'Dropdown'> {
  render(props: PropsFromGenericComponent<'Dropdown'>): JSX.Element | null {
    return <DropdownComponent {...props} />;
  }

  getDisplayData({ targetNode, lookups }: SummaryRendererProps<'Dropdown'>): string {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const value = lookups.formData[targetNode.item.dataModelBindings.simpleBinding] || '';
    return selectedValueToSummaryText(targetNode.item, value, lookups) || '';
  }

  renderSummary(_props: SummaryRendererProps<'Dropdown'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Not implemented</span>;
  }
}
