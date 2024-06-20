import React from 'react';

import { ResolveComponent } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { LayoutSetSummary } from 'src/layout/Summary2/SummaryComponent2/LayoutSetSummary';
import { PageSummary } from 'src/layout/Summary2/SummaryComponent2/PageSummary';
import { TaskSummaryWrapper } from 'src/layout/Summary2/SummaryComponent2/TaskSummary';
import { TaskIdStoreProvider } from 'src/layout/Summary2/taskIdStore';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISummaryComponent2 {
  summaryNode: LayoutNode<'Summary2'>;
}

export function _SummaryComponent2({ summaryNode }: ISummaryComponent2) {
  if (summaryNode.item.whatToRender.type === 'layoutSet') {
    return (
      <LayoutSetSummary
        layoutSetId={summaryNode.item.whatToRender.id}
        summaryOverrides={summaryNode.item.overWriteProperties}
      />
    );
  }

  if (summaryNode.item.whatToRender.type === 'page') {
    return (
      <PageSummary
        pageId={summaryNode.item.whatToRender.id}
        summaryOverrides={summaryNode.item.overWriteProperties}
      />
    );
  }

  if (summaryNode.item.whatToRender.type === 'component') {
    return (
      <ResolveComponent
        componentId={summaryNode.item.id}
        summaryOverrides={summaryNode.item.overWriteProperties}
      />
    );
  }

  if (summaryNode.item.whatToRender.type === 'task') {
    const IDSplitted = summaryNode.item.whatToRender.id.split('>');

    const taskId = IDSplitted.length > 1 ? IDSplitted[0] : summaryNode.item.whatToRender.id;
    const pageId = IDSplitted.length > 1 ? IDSplitted[1] : undefined;

    const componentId = IDSplitted.length > 2 ? IDSplitted[2] : undefined;

    return (
      <TaskIdStoreProvider>
        <TaskSummaryWrapper
          taskId={taskId}
          pageId={pageId}
          componentId={componentId}
          summaryOverrides={summaryNode.item.overWriteProperties}
        />
      </TaskIdStoreProvider>
    );
  }
}

export const SummaryComponent2 = React.forwardRef(_SummaryComponent2);
