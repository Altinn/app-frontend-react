import React from 'react';

import { GenericComponent } from 'src/layout/GenericComponent';
import type { IGrid } from 'src/layout/common.generated';
import type { SummaryDisplayProperties } from 'src/layout/Summary/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISummaryComponent2 {
  summaryNode: LayoutNode<'Summary2'>;
  overrides?: {
    targetNode?: LayoutNode;
    grid?: IGrid;
    largeGroup?: boolean;
    display?: SummaryDisplayProperties;
  };
}

function _SummaryComponent2({ summaryNode }: ISummaryComponent2) {
  return (
    <div>
      {summaryNode.children().map((childNode) => (
        <GenericComponent
          key={childNode.item.id}
          node={childNode}
        />
      ))}
    </div>
  );
}
export const SummaryComponent2 = React.forwardRef(_SummaryComponent2);
