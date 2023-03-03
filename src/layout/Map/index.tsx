import React from 'react';

import { FormComponent } from 'src/layout/LayoutComponent';
import { MapComponent } from 'src/layout/Map/MapComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Map extends FormComponent<'Map'> {
  render(props: PropsFromGenericComponent<'Map'>): JSX.Element | null {
    return <MapComponent {...props} />;
  }

  getDisplayData(_props: SummaryRendererProps<'Map'>): string {
    // PRIORITY: Implement
    return '';
  }

  renderSummary(_props: SummaryRendererProps<'Map'>): JSX.Element | null {
    // PRIORITY: Implement
    return null;
  }
}
