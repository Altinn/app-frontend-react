import React from 'react';

import { GridComponent } from 'src/layout/Grid/GridComponent';
import { GridHierarchyGenerator } from 'src/layout/Grid/hierarchy';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { ComponentHierarchyGenerator, HierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';

export class Grid extends ContainerComponent<'Grid'> {
  render(props: PropsFromGenericComponent<'Grid'>): JSX.Element | null {
    return <GridComponent {...props} />;
  }

  renderSummary(_props: SummaryRendererProps<'Grid'>): JSX.Element | null {
    // PRIORITY: Implement
    return null;
  }

  useDisplayData(_node: LayoutNodeFromType<'Grid'>): string {
    // PRIORITY: Implement
    return '';
  }

  hierarchyGenerator(generator: HierarchyGenerator): ComponentHierarchyGenerator<'Grid'> {
    return new GridHierarchyGenerator(generator);
  }

  canRenderInTable(): boolean {
    return false;
  }
}
