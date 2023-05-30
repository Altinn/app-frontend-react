import React from 'react';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { FormComponent } from 'src/layout/LayoutComponent';
import { MapComponent } from 'src/layout/Map/MapComponent';
import { MapComponentSummary } from 'src/layout/Map/MapComponentSummary';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ILayoutCompMap } from 'src/layout/Map/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class Map extends FormComponent<'Map'> {
  render(props: PropsFromGenericComponent<'Map'>): JSX.Element | null {
    return <MapComponent {...props} />;
  }

  useDisplayData(node: LayoutNodeFromType<'Map'>): string {
    const formData = useAppSelector((state) => state.formData.formData);
    if (!node.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    return formData[node.item.dataModelBindings.simpleBinding] || '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Map'>): JSX.Element | null {
    return <MapComponentSummary targetNode={targetNode} />;
  }

  canRenderInTable(): boolean {
    return false;
  }
}

export const Config = {
  def: new Map(),
  types: {
    layout: {} as unknown as ILayoutCompMap,
    nodeItem: {} as unknown as ExprResolved<ILayoutCompMap>,
    nodeObj: typeof LayoutNode,
  },
};
