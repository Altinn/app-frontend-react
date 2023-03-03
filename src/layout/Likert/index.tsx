import React from 'react';

import { FormComponent } from 'src/layout/LayoutComponent';
import { LikertComponent } from 'src/layout/Likert/LikertComponent';
import { LayoutStyle } from 'src/types';
import { selectedValueToSummaryText } from 'src/utils/formComponentUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Likert extends FormComponent<'Likert'> {
  render(props: PropsFromGenericComponent<'Likert'>): JSX.Element | null {
    return <LikertComponent {...props} />;
  }

  directRender(props: PropsFromGenericComponent<'Likert'>): boolean {
    return props.layout === LayoutStyle.Table;
  }

  renderWithLabel(): boolean {
    return false;
  }

  getDisplayData({ targetNode, lookups }: SummaryRendererProps<'Likert'>): string {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const value = lookups.formData[targetNode.item.dataModelBindings.simpleBinding] || '';
    return selectedValueToSummaryText(targetNode.item, value, lookups) || '';
  }

  renderSummary(_props: SummaryRendererProps<'Likert'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Nothing implemented yet</span>;
  }
}
