import React, { useEffect, useState } from 'react';

import { Accordion } from '@digdir/designsystemet-react';

import { FormProvider } from 'src/features/form/FormContext';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { Lang } from 'src/features/language/Lang';
import { ComponentSummary } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { PageSummary } from 'src/layout/Summary2/SummaryComponent2/PageSummary';
import { useTaskStore } from 'src/layout/Summary2/taskIdStore';
import { useNodes } from 'src/utils/layout/NodesContext';

interface TaskSummaryProps {
  taskId: string;
  pageId?: string;
  componentId?: string;
  summaryOverrides: any;
  hideEditButton?: boolean;
}

function TaskSummaryAccordion({ pageKey, children }: React.PropsWithChildren<{ pageKey: string }>) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Accordion
      border
      color={'neutral'}
    >
      <Accordion.Item
        key={pageKey}
        open={isOpen}
      >
        <Accordion.Header onHeaderClick={() => setIsOpen(!isOpen)}>
          <Lang id={pageKey} />
        </Accordion.Header>
        <Accordion.Content>{children}</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

function TaskSummary({ pageId, componentId, summaryOverrides }: TaskSummaryProps) {
  const nodes = useNodes();
  if (componentId) {
    const nodeToRender = nodes.findById(componentId);
    return (
      nodeToRender && (
        <ComponentSummary
          componentNode={nodeToRender}
          summaryOverrides={summaryOverrides}
        />
      )
    );
  }

  let pageKeys = nodes.allPageKeys();

  if (pageId) {
    pageKeys = pageKeys.filter((key) => key === pageId);
  }

  return (
    <div style={{ width: '100%' }}>
      {pageKeys.map((page) => (
        <div
          style={{ marginBottom: '10px' }}
          key={page}
        >
          <TaskSummaryAccordion pageKey={page}>
            <PageSummary
              pageId={page}
              summaryOverrides={summaryOverrides}
            />
          </TaskSummaryAccordion>
        </div>
      ))}
    </div>
  );
}
export function TaskSummaryWrapper({
  taskId,
  pageId,
  componentId,
  summaryOverrides,
}: React.PropsWithChildren<TaskSummaryProps>) {
  const { setTaskId, setOverriddenDataModelId, setOverriddenLayoutSetId, overriddenTaskId } = useTaskStore((state) => ({
    setTaskId: state.setTaskId,
    setOverriddenDataModelId: state.setOverriddenDataModelId,
    setOverriddenLayoutSetId: state.setOverriddenLayoutSetId,
    overriddenTaskId: state.overriddenTaskId,
  }));

  const layoutSets = useLayoutSets();
  const layoutSetForTask = layoutSets.sets.find((set) => set.tasks?.includes(taskId));
  useEffect(() => {
    if (layoutSetForTask) {
      setTaskId && setTaskId(taskId);
      setOverriddenDataModelId && setOverriddenDataModelId(layoutSetForTask.dataType);
      setOverriddenLayoutSetId && setOverriddenLayoutSetId(layoutSetForTask.id);
    }
  }, [layoutSetForTask, setOverriddenDataModelId, setOverriddenLayoutSetId, setTaskId, taskId]);

  if (overriddenTaskId) {
    return (
      <FormProvider>
        <TaskSummary
          taskId={taskId}
          pageId={pageId}
          componentId={componentId}
          summaryOverrides={summaryOverrides}
        />
      </FormProvider>
    );
  }
}
