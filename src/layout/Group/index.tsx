import React from 'react';

import { GroupRenderer } from 'src/layout/Group/GroupRenderer';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class Group extends ContainerComponent<'Group'> {
  directRender(): boolean {
    return true;
  }

  render(props: PropsFromGenericComponent<'Group'>): JSX.Element | null {
    return <GroupRenderer {...props} />;
  }

  renderSummary(_props: SummaryRendererProps<'Group'>): JSX.Element | null {
    // PRIORITY: Implement
    throw new Error('Not implemented');
  }

  useDisplayData(_node: LayoutNodeFromType<'Group'>): string {
    // PRIORITY: Implement
    return '';
  }
}
