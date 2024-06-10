import React from 'react';

import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { useNode } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { NodeRef } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

type Props = Pick<SummaryRendererProps<'Cards'>, 'targetNode' | 'summaryNode' | 'overrides'>;

export function CardsSummary({ targetNode, summaryNode, overrides }: Props) {
  const cardsInternal = useNodeItem(targetNode, (i) => i.cardsInternal);
  const children = cardsInternal.map((card) => card.children).flat();

  return (
    <>
      {children.map((child) => {
        if (!child) {
          return null;
        }

        return (
          <CardSummary
            key={child.nodeRef}
            nodeRef={child}
            summaryNode={summaryNode}
            overrides={overrides}
          />
        );
      })}
    </>
  );
}

type CardSummaryProps = Pick<Props, 'summaryNode' | 'overrides'> & { nodeRef: NodeRef };

function CardSummary({ nodeRef, summaryNode, overrides }: CardSummaryProps) {
  const node = useNode(nodeRef);
  return (
    <SummaryComponent
      summaryNode={summaryNode}
      overrides={{
        ...overrides,
        targetNode: node,
        grid: {},
        largeGroup: true,
      }}
    />
  );
}
