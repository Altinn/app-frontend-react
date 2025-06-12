import React from 'react';
import type { JSX } from 'react';

import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { useHasCapability } from 'src/utils/layout/canRenderIn';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useNode } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

type Props = Pick<SummaryRendererProps<'Tabs'>, 'targetNode' | 'summaryNode' | 'overrides'>;

export function TabsSummaryComponent({ targetNode, summaryNode, overrides }: Props): JSX.Element | null {
  const tabs = useNodeItem(targetNode, (i) => i.tabs);
  const childIds = tabs.map((card) => card.children).flat();

  return (
    <>
      {childIds.map((childId) => (
        <Child
          key={childId}
          baseId={childId}
          summaryNode={summaryNode}
          overrides={overrides}
        />
      ))}
    </>
  );
}

function Child({ baseId, summaryNode, overrides }: { baseId: string } & Pick<Props, 'summaryNode' | 'overrides'>) {
  const nodeId = useIndexedId(baseId);
  const node = useNode(nodeId);
  const canRender = useHasCapability('renderInTabs');
  if (!node || !canRender(baseId)) {
    return null;
  }

  return (
    <SummaryComponent
      key={node.id}
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
