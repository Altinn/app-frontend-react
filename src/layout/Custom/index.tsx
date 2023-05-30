import React from 'react';

import { CustomWebComponent } from 'src/layout/Custom/CustomWebComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompCustom } from 'src/layout/Custom/types';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class Custom extends FormComponent<'Custom'> {
  render(props: PropsFromGenericComponent<'Custom'>): JSX.Element | null {
    return <CustomWebComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }

  useDisplayData(node: LayoutNodeFromType<'Custom'>): string {
    const data = node.getFormData();
    return Object.values(data).join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Custom'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }
}

export const Config = {
  def: new Custom(),
  types: {
    layout: {} as unknown as ILayoutCompCustom,
    nodeItem: {} as unknown as ExprResolved<ILayoutCompCustom>,
    nodeObj: LayoutNode,
  },
};
