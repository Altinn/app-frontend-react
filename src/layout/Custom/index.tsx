import React from 'react';

import { CustomWebComponent } from 'src/layout/Custom/CustomWebComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Custom extends FormComponent<'Custom'> {
  render(props: PropsFromGenericComponent<'Custom'>): JSX.Element | null {
    return <CustomWebComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  getDisplayData(_props: SummaryRendererProps<'Custom'>): string {
    // PRIORITY: Implement
    return '';
  }

  renderSummary(_props: SummaryRendererProps<'Custom'>): JSX.Element | null {
    // PRIORITY: Implement
    return null;
  }
}
