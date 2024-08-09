import React from 'react';

import { ResolveComponent } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { LayoutSetSummary } from 'src/layout/Summary2/SummaryComponent2/LayoutSetSummary';
import { PageSummary } from 'src/layout/Summary2/SummaryComponent2/PageSummary';
import { TaskSummary, TaskSummaryWrapper } from 'src/layout/Summary2/SummaryComponent2/TaskSummary';
import { Summary2StoreProvider } from 'src/layout/Summary2/taskIdStore';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISummaryComponent2 {
  summaryNode: LayoutNode<'Summary2'>;
}

function SummaryBody({ summaryNode }: ISummaryComponent2) {
  if (!summaryNode.item.target) {
    return <LayoutSetSummary />;
  }

  if (summaryNode.item.target?.taskId) {
    return (
      <TaskSummary
        taskId={summaryNode.item.target?.taskId}
        pageId={summaryNode.item.target?.type === 'page' ? summaryNode.item.target.id : undefined}
        componentId={summaryNode.item.target?.type === 'component' ? summaryNode.item.target.id : undefined}
        summaryOverrides={summaryNode.item.overrides}
        showAccordion={summaryNode.item.showPageInAccordion}
      />
    );
  }

  if (summaryNode.item.target?.type === 'page') {
    return (
      <PageSummary
        pageId={summaryNode.item.target.id}
        summaryOverrides={summaryNode.item.overrides}
      />
    );
  }

  if (summaryNode.item.target?.type === 'component') {
    return (
      <ResolveComponent
        summaryProps={summaryNode.item}
        summaryOverrides={summaryNode.item.overrides}
      />
    );
  }
}

export function _SummaryComponent2({ summaryNode }: ISummaryComponent2) {
  // console.log('summaryNode', summaryNode.item.hideEmptyFields);

  // return;
  //
  // if (!summaryNode.item.target) {
  //   return <LayoutSetSummary />;
  // }
  //
  // if (summaryNode.item.target?.taskId) {
  return (
    <Summary2StoreProvider>
      <TaskSummaryWrapper
        taskId={summaryNode.item.target?.taskId}
        pageId={summaryNode.item.target?.type === 'page' ? summaryNode.item.target.id : undefined}
        componentId={summaryNode.item.target?.type === 'component' ? summaryNode.item.target.id : undefined}
        summaryOverrides={summaryNode.item.overrides}
        showAccordion={summaryNode.item.showPageInAccordion}
      >
        <SummaryBody summaryNode={summaryNode} />
      </TaskSummaryWrapper>
    </Summary2StoreProvider>
  );

  // if (summaryNode.item.target?.type === 'page') {
  //   return (
  //     <PageSummary
  //       pageId={summaryNode.item.target.id}
  //       summaryOverrides={summaryNode.item.overrides}
  //     />
  //   );
  // }
  //
  // if (summaryNode.item.target?.type === 'component') {
  //   return (
  //     <ResolveComponent
  //       summaryProps={summaryNode.item}
  //       summaryOverrides={summaryNode.item.overrides}
  //     />
  //   );
  // }
}

export const SummaryComponent2 = React.forwardRef(_SummaryComponent2);
