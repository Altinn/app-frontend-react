import React from 'react';

import { Accordion } from '@digdir/designsystemet-react';

import { Lang } from 'src/features/language/Lang';
import { usePageOrder } from 'src/hooks/useNavigatePage';
import { PageSummary } from 'src/layout/Summary2/SummaryComponent2/PageSummary';
import classes from 'src/layout/Summary2/SummaryComponent2/SummaryComponent2.module.css';
import { useSummary2Store } from 'src/layout/Summary2/summaryStoreContext';

type LayoutSetSummaryProps = {
  pageKey?: string;
};

type LayoutSetAccordionSummaryProps = {
  filteredPages: string[];
};

export function TaskSummaryAccordion({ filteredPages }: LayoutSetAccordionSummaryProps) {
  return (
    <Accordion
      border
      color={'neutral'}
      className={classes.summaryItem}
    >
      {filteredPages.map((layoutId: string) => (
        <Accordion.Item key={layoutId}>
          <Accordion.Header>
            <Lang id={layoutId} />
          </Accordion.Header>
          <Accordion.Content>
            {
              <PageSummary
                pageId={layoutId}
                key={layoutId}
              />
            }
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

export function LayoutSetSummary({ pageKey }: LayoutSetSummaryProps) {
  const pageOrder = usePageOrder();

  const { summaryItem } = useSummary2Store((state) => ({
    summaryItem: state.summaryItem,
  }));

  const filteredPages = pageOrder.filter((layoutId) => {
    if (!pageKey) {
      return layoutId;
    }
    return layoutId === pageKey;
  });

  if (summaryItem?.showPageInAccordion) {
    return <TaskSummaryAccordion filteredPages={filteredPages} />;
  }

  return filteredPages.map((layoutId) => (
    <PageSummary
      pageId={layoutId}
      key={layoutId}
    />
  ));
}
