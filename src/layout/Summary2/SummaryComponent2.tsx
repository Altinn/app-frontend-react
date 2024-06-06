import React, { useEffect, useRef, useState } from 'react';

import { useGetDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { FormProvider } from 'src/features/form/FormContext';
import { useLayoutQuery, useLayouts } from 'src/features/form/layout/LayoutsContext';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useGetLayoutSetById } from 'src/features/form/layoutSets/useCurrentLayoutSetId';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { useTaskStore } from 'src/layout/Summary2/taskIdStore';
import { fetchLayouts } from 'src/queries/queries';
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

function LayoutSetSummary({ layoutSetId, summaryOverrides }: LayoutSetSummaryProps) {
  const layoutSet = useGetLayoutSetById(layoutSetId);

  const layouts = Object.keys(useLayouts());
  if (!layoutSet) {
    throw new Error('LayoutSetId invalid in LayoutSetSummary.');
  }
  return (
    <div style={{ border: '2px solid blue' }}>
      {layouts.map((layoutId) => (
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
    <div style={{ border: '2px solid yellow', display: 'flex', flexDirection: 'column' }}>
      {renderedComponent && <div>{renderedComponent}</div>}
      {childComponents}
    </div>
  );
}

function PageSummary({ pageId, summaryOverrides }: PageSummaryProps) {
  const page = useGetPage(pageId);

  if (!page) {
    throw new Error('PageId invalid in PageSummary.');
  }

  return (
    <div style={{ border: '2px solid green' }}>
      {page.children().map((child) => (
        <ComponentSummary
          componentNode={child}
          key={child.item.id}
          summaryOverrides={summaryOverrides}
        />
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
  // const summaryPropsFromComponent = resolvedComponent?.item.summaryProps ? resolvedComponent.item.summaryProps : {};

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
  summaryOverrides: any;
}

interface TaskSummaryWrapperProps {
  taskId: string;
  summaryOverrides: any;
}

function TaskSummary({ taskId, summaryOverrides }: TaskSummaryProps) {
  const nodes = useNodes();
  console.log('nodes', nodes);
  console.log('nodes.allNodes()', nodes.allNodes());

  const layouts = useLayouts();

  console.log('layouts', layouts);

  const dataModelGuid = useGetDataModelGuid(taskId);
  const layoutSets = useLayoutSets();
  const layoutSetForTask = layoutSets.sets.find((set) => set.tasks?.includes(taskId));
  const layoutIdToFetch = layoutSets.sets.find((set) => set.tasks?.includes(taskId));

  console.log('layoutIdToFetch', layoutIdToFetch);

  const res = useLayoutQuery(layoutIdToFetch?.id);

  console.log('res', res);

  return (
    <div>
      <pre>{JSON.stringify({ layoutSetForTask, layoutSets, layouts }, null, 2)}</pre>

      {nodes.allNodes().map((node) => (
        <ComponentSummary
          key={node.item.id}
          componentNode={node}
          summaryOverrides={summaryOverrides}
        ></ComponentSummary>
      ))}
    </div>
  );

  //return nodes.map((node) => <ComponentSummary componentNode={node}></ComponentSummary>)
  //return <h1>Hi im the tasks summary!</h1>;
  // const { nonUrlTaskId, setTaskId, clearTaskId, depth, setDepth } = useTaskStore();
  // const [taskIdSet, setTaskIdSet] = useState(false);
  //
  // useEffect(() => {
  //   //const layout = useLayoutQuery();
  //   setTaskId(taskId);
  //   setTaskIdSet(true);
  // }, [setTaskId, taskId]);
  //
  // if (taskIdSet) {
  //   return <FormProvider></FormProvider>;
  // }
}

function TaskSummaryWrapper({ taskId, summaryOverrides }: React.PropsWithChildren<TaskSummaryProps>) {
  // const summaryPropsFromComponent = resolvedComponent?.item.summaryProps ? resolvedComponent.item.summaryProps : {};
  const { setTaskId, setOverriddenDataModelId, setOverriddenLayoutSetId } = useTaskStore();

  const [taskIdSet, setTaskIdSet] = useState(false);
  const layoutSets = useLayoutSets();
  const layoutSetForTask = layoutSets.sets.find((set) => set.tasks?.includes(taskId));
  useEffect(() => {
    //const layout = useLayoutQuery();

    if (layoutSetForTask) {
      setTaskId(taskId);
      setOverriddenDataModelId(layoutSetForTask.dataType);
      setOverriddenLayoutSetId(layoutSetForTask.id);
      setTaskIdSet(true);
    }
  }, [layoutSetForTask, setOverriddenDataModelId, setOverriddenLayoutSetId, setTaskId, taskId]);

  if (taskIdSet) {
    return (
      <FormProvider>
        <TaskSummary
          taskId={taskId}
          summaryOverrides={summaryOverrides}
        ></TaskSummary>
      </FormProvider>
    );
  }

  // useEffect(() => {
  //   console.log('layoutIdToFetch', layoutIdToFetch);
  //   if (layoutIdToFetch) {
  //     // eslint-disable-next-line react-hooks/rules-of-hooks
  //   }
  //   // setHasRendered(true);
  // }, [layoutSets.sets, taskId]);

  //return <pre>{JSON.stringify({ taskId, dataMoodelGuid, layoutSets, layouts }, null, 2)}</pre>;

  // if (hasRendered) {
  //   return;
  // }
  //
  // // if (depth > 1) {
  // //   return <h1>Jøss?</h1>;
  // // }
  // // setDepth(depth + 1);
  // return (
  //   <div>
  //     <h1>{depth}</h1>
  //     <h2>er jeg her?</h2>
  //     <InstanceProvider>
  //       <FormProvider>
  //         <Form />
  //       </FormProvider>
  //     </InstanceProvider>
  //   </div>
  // );
}

function _SummaryComponent2({ summaryNode }: ISummaryComponent2) {
  const [lodedLayout, setLodedLayout] = useState<any>();
  const hasRendered = useRef(false);

  const guid = useGetDataModelGuid(summaryNode.item.whatToRender.id);

  const instanceId = useLaxInstance()?.instanceId;

  console.log('guid', guid);

  useEffect(() => {
    const fetchLayout = async () => {
      // console.log('fetching');
      // console.log(summaryNode.item.whatToRender.id);
      const res = await fetchLayouts(summaryNode.item.whatToRender.id);
      console.log('res', res);
      setLodedLayout(res);
    };

    if (summaryNode.item.whatToRender.type === 'task' && !lodedLayout) {
      fetchLayout();
    }
  }, [lodedLayout, summaryNode.item.whatToRender.id, summaryNode.item.whatToRender.type]);

  // summaryNode.item.overWriteProperties

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

  // if (summaryNode.item.whatToRender.type === 'task') {
  //   return <h1>Render task here</h1>;
  // }

  if (summaryNode.item.whatToRender.type === 'task') {
    // setTaskId(summaryNode.item.whatToRender.id);

    return (
      <TaskSummaryWrapper
        taskId={summaryNode.item.whatToRender.id}
        summaryOverrides={summaryNode.item.overWriteProperties}
      />
    );

    // if (!hasRendered.current) {
    //   hasRendered.current = true;
    //   return (
    //     <InstanceProvider>
    //       <FormProvider>
    //         <Form />
    //       </FormProvider>
    //     </InstanceProvider>
    //   );
    // }
  }
}
export const SummaryComponent2 = React.forwardRef(_SummaryComponent2);
