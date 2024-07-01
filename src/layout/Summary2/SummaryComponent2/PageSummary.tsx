import React from 'react';

import { ComponentSummary } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { useGetPage } from 'src/utils/layout/NodesContext';
import { useNodeTraversal } from 'src/utils/layout/useNodeTraversal';

interface PageSummaryProps {
  pageId: string;
  summaryOverrides: any;
}

export function PageSummary({ pageId, summaryOverrides }: PageSummaryProps) {
  const page = useGetPage(pageId);
  const children = useNodeTraversal((t) => (t.targetIsPage() ? t.children() : undefined), page);
  if (!page || !children) {
    throw new Error('PageId invalid in PageSummary.');
  }

  return children.map((child) => (
    <ComponentSummary
      componentNode={child}
      key={child.id}
      summaryOverrides={summaryOverrides}
    />
  ));
}
