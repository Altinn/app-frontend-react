import React from 'react';

import { AddressComponent } from 'src/layout/Address/AddressComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class Address extends FormComponent<'AddressComponent'> {
  render(props: PropsFromGenericComponent<'AddressComponent'>): JSX.Element | null {
    return <AddressComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  useDisplayData(node: LayoutNodeFromType<'AddressComponent'>): string {
    // PRIORITY: Implement
    return '';
  }

  renderSummary(_props: SummaryRendererProps<'AddressComponent'>): JSX.Element | null {
    // PRIORITY: Implement
    return null;
  }
}
