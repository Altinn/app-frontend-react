import React from 'react';

import { usePageOrder } from 'src/hooks/useNavigatePage';
import { PageSummary } from 'src/layout/Summary2/SummaryComponent2/PageSummary';
import type { CompInternal } from 'src/layout/layout';

interface LayoutSetSummaryProps {
  layoutSetId?: string;
  summaryOverrides?: CompInternal<'Summary2'>['overrides'];
}

export function LayoutSetSummary({ layoutSetId, summaryOverrides }: LayoutSetSummaryProps) {
  const pageOrder = usePageOrder();

  return pageOrder
    .filter((layoutId) => {
      if (!layoutSetId) {
        return layoutId;
      }
      return layoutId === layoutSetId;
    })
    .map((layoutId) => (
      <PageSummary
        pageId={layoutId}
        key={layoutId}
        summaryOverrides={summaryOverrides}
      />
    ));
}
