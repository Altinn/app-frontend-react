import React from 'react';

import { CustomDef } from 'src/layout/Custom/config.generated';
import { CustomWebComponent } from 'src/layout/Custom/CustomWebComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompCustom } from 'src/layout/Custom/types';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Custom extends CustomDef {
  render(props: PropsFromGenericComponent<'Custom'>): JSX.Element | null {
    return <CustomWebComponent {...props} />;
  }

  getDisplayData(node: LayoutNodeFromType<'Custom'>): string {
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
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutCompCustom;
  nodeItem: ExprResolved<ILayoutCompCustom>;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'title';
  validDataModelBindings: undefined;
};
