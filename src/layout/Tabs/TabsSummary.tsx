import React from 'react';
import type { JSX } from 'react';

import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { useNode } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { NodeRef } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

type Props = Pick<SummaryRendererProps<'Tabs'>, 'targetNode' | 'summaryNode' | 'overrides'>;

export function TabsSummary({ targetNode, summaryNode, overrides }: Props): JSX.Element | null {
  const tabsInternal = useNodeItem(targetNode, (i) => i.tabsInternal);
  const children = tabsInternal.map((card) => card.children).flat();

  return (
    <>
      {children.map((child) => {
        if (!child) {
          return null;
        }

        return (
          <TabSummary
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

type TabSummaryProps = Pick<Props, 'summaryNode' | 'overrides'> & { nodeRef: NodeRef };

function TabSummary({ nodeRef, summaryNode, overrides }: TabSummaryProps) {
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
