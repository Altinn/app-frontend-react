import React from 'react';

import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class Summary extends ContainerComponent<'Summary'> {
  directRender(): boolean {
    return true;
  }

  render(props: PropsFromGenericComponent<'Summary'>): JSX.Element | null {
    return (
      <SummaryComponent
        summaryNode={props.node}
        overrides={props.overrideItemProps}
      />
    );
  }

  renderSummary(_props: SummaryRendererProps<'Summary'>): JSX.Element | null {
    // PRIORITY: Implement? Rendering summary in summary should not do anything. Maybe we should print an error.
    return null;
  }

  useDisplayData(_node: LayoutNodeFromType<'Summary'>): string {
    // PRIORITY: Implement?
    return '';
  }
}
