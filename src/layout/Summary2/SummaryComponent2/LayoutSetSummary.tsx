import React from 'react';

import { usePageOrder } from 'src/hooks/useNavigatePage';
import { PageSummary } from 'src/layout/Summary2/SummaryComponent2/PageSummary';
import type { CompInternal } from 'src/layout/layout';

interface LayoutSetSummaryProps {
  layoutSetId?: string;
  summaryOverrides?: CompInternal<'Summary2'>['overrides']; // TODO: Remove this after merge from main? It was removed there
}

export function LayoutSetSummary({ layoutSetId }: LayoutSetSummaryProps) {
  const pageOrder = usePageOrder();

  const filteredPages = pageOrder.filter((layoutId) => {
    if (!layoutSetId) {
      return layoutId;
    }
    return layoutId === layoutSetId;
  });

  return filteredPages.map((layoutId) => (
    <PageSummary
      pageId={layoutId}
      key={layoutId}
      summaryOverrides={undefined} // FIXME: should have overrides? From where?
    />
  ));
}
