import React from 'react';

import { FormComponent } from 'src/layout/LayoutComponent';
import { TextAreaComponent } from 'src/layout/TextArea/TextAreaComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class TextArea extends FormComponent<'TextArea'> {
  render(props: PropsFromGenericComponent<'TextArea'>): JSX.Element | null {
    return <TextAreaComponent {...props} />;
  }

  getDisplayData({ targetNode, lookups }: SummaryRendererProps<'TextArea'>): string {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    return lookups.formData[targetNode.item.dataModelBindings.simpleBinding] || '';
  }

  renderSummary(_props: SummaryRendererProps<'TextArea'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Nothing implemented yet</span>;
  }
}
