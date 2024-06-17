import React from 'react';

import { useOrder } from 'src/hooks/useNavigatePage';
import { PageSummary } from 'src/layout/Summary2/SummaryComponent2/PageSummary';

interface LayoutSetSummaryProps {
  layoutSetId: string;
  summaryOverrides: any;
}

export function LayoutSetSummary({ summaryOverrides }: LayoutSetSummaryProps) {
  const pageOrder = useOrder();
  return pageOrder.map((layoutId) => (
    <PageSummary
      pageId={layoutId}
      key={layoutId}
      summaryOverrides={summaryOverrides}
    />
  ));
}
