import React from 'react';

import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function GridSummaryComponent({ targetNode, summaryNode }: SummaryRendererProps<'Grid'>): JSX.Element | null {
  const nodes = getSummaryNodes(targetNode);
  return (
    <>
      {nodes.map((node, idx) => (
        <SummaryComponent
          key={node.item.id}
          summaryNode={summaryNode}
          overrides={{
            targetNode: node,
            display: {
              hideBottomBorder: idx === nodes.length - 1,
            },
          }}
        />
      ))}
    </>
  );
}

function getSummaryNodes(node: LayoutNodeFromType<'Grid'>): LayoutNode[] {
  const out: LayoutNode[] = [];
  for (const row of node.item.rows) {
    if (row.header || row.readOnly) {
      continue;
    }
    for (const cell of row.cells) {
      if (cell && 'text' in cell) {
        continue;
      }
      const node = cell?.node as LayoutNode;
      if (!node || !('renderSummary' in node.def)) {
        continue;
      }
      out.push(node);
    }
  }

  return out;
}
