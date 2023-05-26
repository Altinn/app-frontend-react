import React from 'react';

import { RenderGrid } from 'src/layout/Grid/GridComponent';
import { GridSummaryComponent } from 'src/layout/Grid/GridSummaryComponent';
import { GridHierarchyGenerator } from 'src/layout/Grid/hierarchy';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';

export class Grid extends ContainerComponent<'Grid'> {
  private _hierarchyGenerator = new GridHierarchyGenerator();

  render(props: PropsFromGenericComponent<'Grid'>): JSX.Element | null {
    return <RenderGrid {...props} />;
  }

  renderSummary(props: SummaryRendererProps<'Grid'>): JSX.Element | null {
    return <GridSummaryComponent {...props} />;
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  useDisplayData(_node: LayoutNodeFromType<'Grid'>): string {
    return '';
  }

  hierarchyGenerator(): ComponentHierarchyGenerator<'Grid'> {
    return this._hierarchyGenerator;
  }

  canRenderInTable(): boolean {
    return false;
  }
}
