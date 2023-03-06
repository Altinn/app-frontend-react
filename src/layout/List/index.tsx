import React from 'react';

import { FormComponent } from 'src/layout/LayoutComponent';
import { ListComponent } from 'src/layout/List/ListComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class List extends FormComponent<'List'> {
  render(props: PropsFromGenericComponent<'List'>): JSX.Element | null {
    return <ListComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  useDisplayData(_node: LayoutNodeFromType<'List'>): string {
    // PRIORITY: Implement
    return '';
  }

  renderSummary(_props: SummaryRendererProps<'List'>): JSX.Element | null {
    // PRIORITY: Implement
    return null;
  }
}
