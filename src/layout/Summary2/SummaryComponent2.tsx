import React, { useEffect, useState } from 'react';

import { Accordion } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import cn from 'classnames';

import { FormProvider } from 'src/features/form/FormContext';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useOrder } from 'src/hooks/useNavigatePage';
import classes from 'src/layout/Summary2/SummaryComponent2.module.css';
import { TaskIdStoreProvider, useTaskStore } from 'src/layout/Summary2/taskIdStore';
import { gridBreakpoints, pageBreakStyles } from 'src/utils/formComponentUtils';
import { useGetPage, useNode, useNodes } from 'src/utils/layout/NodesContext';
import type { CompSummary2External, CompSummary2Internal } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISummaryComponent2 {
  summaryNode: LayoutNode<'Summary2'>;
}

interface LayoutSetSummaryProps {
  layoutSetId: string;
  summaryOverrides: any;
}
interface PageSummaryProps {
  pageId: string;
  summaryOverrides: any;
}

interface ComponentSummaryProps {
  componentNode: LayoutNode;
  summaryOverrides: CompSummary2Internal['overWriteProperties'];
}

function LayoutSetSummary({ summaryOverrides }: LayoutSetSummaryProps) {
  const pageOrder = useOrder();
  return (
    <div>
      {pageOrder.map((layoutId) => (
        <PageSummary
          pageId={layoutId}
          key={layoutId}
          summaryOverrides={summaryOverrides}
        />
      ))}
    </div>
  );
}

function ComponentSummary({ componentNode, summaryOverrides }: ComponentSummaryProps) {
  if (componentNode.isHidden()) {
    return null;
  }

  const overrides = summaryOverrides?.find((override) => override.componentId === componentNode.item.id);

  const childComponents =
    componentNode.item.type === 'Group' &&
    componentNode.item.childComponents.map((child) => (
      <ComponentSummary
        componentNode={child}
        key={child.item.id}
        summaryOverrides={summaryOverrides}
      />
    ));

  const renderedComponent = componentNode.def.renderSummary2
    ? componentNode.def.renderSummary2(componentNode as LayoutNode<any>, overrides)
    : null;

  return (
    <Grid
      item={true}
      className={cn(pageBreakStyles(componentNode.item?.pageBreak), classes.summaryItem)}
      {...gridBreakpoints(componentNode.item.grid)}
    >
      {renderedComponent}
      {childComponents}
    </Grid>
  );
}

function PageSummary({ pageId, summaryOverrides }: PageSummaryProps) {
  const page = useGetPage(pageId);
  if (!page) {
    throw new Error('PageId invalid in PageSummary.');
  }

  return (
    <div>
      {page.children().map((child) => (
        <>
          <ComponentSummary
            componentNode={child}
            key={child.item.id}
            summaryOverrides={summaryOverrides}
          />
        </>
      ))}
    </div>
  );
}

interface ResolveComponentProps {
  summaryProps: CompSummary2External;
  summaryOverrides: any;
}

function ResolveComponent({ summaryProps, summaryOverrides }: ResolveComponentProps) {
  const resolvedComponent = useNode(summaryProps.whatToRender.id);

  if (!resolvedComponent) {
    return null;
  }

  return (
    <ComponentSummary
      componentNode={resolvedComponent}
      summaryOverrides={summaryOverrides}
    />
  );
}

interface TaskSummaryProps {
  taskId: string;
  pageId?: string;
  componentId?: string;
  summaryOverrides: any;
}
function TaskSummary({ pageId, componentId, summaryOverrides }: TaskSummaryProps) {
  const nodes = useNodes();
  const { langAsString } = useLanguage();

  if (componentId) {
    const nodeToRender = nodes.findById(componentId);
    return (
      nodeToRender && (
        <div style={{ width: '100%' }}>
          <ComponentSummary
            componentNode={nodeToRender}
            summaryOverrides={summaryOverrides}
          />
        </div>
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
          <Accordion
            border
            color={'neutral'}
          >
            <Accordion.Item key={page}>
              <Accordion.Header>{langAsString(page)}</Accordion.Header>
              <Accordion.Content>
                <PageSummary
                  pageId={page}
                  summaryOverrides={summaryOverrides}
                />
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </div>
      ))}
    </div>
  );
}

function TaskSummaryWrapper({
  taskId,
  pageId,
  componentId,
  summaryOverrides,
}: React.PropsWithChildren<TaskSummaryProps>) {
  const { setTaskId, setOverriddenDataModelId, setOverriddenLayoutSetId } = useTaskStore((state) => ({
    setTaskId: state.setTaskId,
    setOverriddenDataModelId: state.setOverriddenDataModelId,
    setOverriddenLayoutSetId: state.setOverriddenLayoutSetId,
  }));

  const [taskIdSet, setTaskIdSet] = useState(false);
  const layoutSets = useLayoutSets();
  const layoutSetForTask = layoutSets.sets.find((set) => set.tasks?.includes(taskId));
  useEffect(() => {
    if (layoutSetForTask) {
      setTaskId && setTaskId(taskId);
      setOverriddenDataModelId && setOverriddenDataModelId(layoutSetForTask.dataType);
      setOverriddenLayoutSetId && setOverriddenLayoutSetId(layoutSetForTask.id);
      setTaskIdSet(true);
    }
  }, [layoutSetForTask, setOverriddenDataModelId, setOverriddenLayoutSetId, setTaskId, taskId]);

  if (taskIdSet) {
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

function _SummaryComponent2({ summaryNode }: ISummaryComponent2) {
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
        summaryProps={summaryNode.item}
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
