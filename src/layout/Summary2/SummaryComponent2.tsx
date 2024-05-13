import React from 'react';

import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { useGetLayoutSetById } from 'src/features/form/layoutSets/useCurrentLayoutSetId';
import { useGetPage } from 'src/utils/layout/NodesContext';
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

interface LayoutSetSummaryProps {
  layoutSetId: string;
}
interface PageSummaryProps {
  pageId: string;
}

interface ComponentSummaryProps {
  componentNode: LayoutNode;
}

function LayoutSetSummary({ layoutSetId }: LayoutSetSummaryProps) {
  const layoutSet = useGetLayoutSetById(layoutSetId);

  const layouts = Object.keys(useLayouts());
  if (!layoutSet) {
    throw new Error('LayoutSetId invalid in LayoutSetSummary.');
  }
  return (
    <div style={{ border: '1px solid blue' }}>
      <h1>LayoutSummary:</h1>
      {layouts.map((layoutId) => (
        <PageSummary
          pageId={layoutId}
          key={layoutId}
        />
      ))}
    </div>
  );
}

function ComponentSummary({ componentNode }: ComponentSummaryProps) {
  if (componentNode.isHidden()) {
    return null;
  }

  if (componentNode.def.renderSummary2) {
    const renderedComponent = componentNode.def.renderSummary2(componentNode as LayoutNode<any>);

    if (!renderedComponent) {
      return null;
    }

    return <div style={{ border: '1px solid yellow' }}>{renderedComponent}</div>;
  }
}

function PageSummary({ pageId }: PageSummaryProps) {
  const page = useGetPage(pageId);

  if (!page) {
    throw new Error('PageId invalid in PageSummary.');
  }

  return (
    <div style={{ border: '1px solid  green' }}>
      {page.children().map((child) => (
        <ComponentSummary
          componentNode={child}
          key={child.item.id}
        />
      ))}
    </div>
  );
}

function _SummaryComponent2({ summaryNode }: ISummaryComponent2) {
  if (summaryNode.item.whatToRender.type === 'layoutSet') {
    return <LayoutSetSummary layoutSetId={summaryNode.item.whatToRender.id} />;
  }

  if (summaryNode.item.whatToRender.type === 'page') {
    return <PageSummary pageId={summaryNode.item.whatToRender.id} />;
  }

  if (summaryNode.item.whatToRender.type === 'component') {
    return <ComponentSummary componentNode={summaryNode} />;
  }

  throw new Error(`Invalid summary render type: ${summaryNode.item.whatToRender.type}`);
}
export const SummaryComponent2 = React.forwardRef(_SummaryComponent2);
