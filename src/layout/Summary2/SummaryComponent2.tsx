import React from 'react';

import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { useGetLayoutSetById } from 'src/features/form/layoutSets/useCurrentLayoutSetId';
import { useGetPage, useNode } from 'src/utils/layout/NodesContext';
import type { IGrid } from 'src/layout/common.generated';
import type { SummaryDisplayProperties } from 'src/layout/Summary/config.generated';
import type { CompSummary2External } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISummaryComponent2 {
  summaryNode: LayoutNode<'Summary2'>;
  overrides?: {
    targetNode?: LayoutNode;
    grid?: IGrid;
    largeGroup?: boolean;
    display?: SummaryDisplayProperties;
  };
}

interface LayoutSetSummaryProps {
  layoutSetId: string;
}
interface PageSummaryProps {
  pageId: string;
}

interface ComponentSummaryProps {
  componentNode: LayoutNode;
}

function LayoutSetSummary({ layoutSetId }: LayoutSetSummaryProps) {
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
        />
      ))}
    </div>
  );
}

function ComponentSummary({ componentNode }: ComponentSummaryProps) {
  if (componentNode.isHidden()) {
    return null;
  }

  const childComponents =
    componentNode.item.type === 'Group' &&
    componentNode.item.childComponents.map((child) => (
      <ComponentSummary
        componentNode={child}
        key={child.item.id}
      />
    ));

  const renderedComponent = componentNode.def.renderSummary2
    ? componentNode.def.renderSummary2(componentNode as LayoutNode<any>)
    : null;

  return (
    <div style={{ border: '2px solid yellow', display: 'flex', flexDirection: 'column' }}>
      {renderedComponent && <div>{renderedComponent}</div>}
      {childComponents}
    </div>
  );
}

function PageSummary({ pageId }: PageSummaryProps) {
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
        />
      ))}
    </div>
  );
}

interface ResolveComponentProps {
  summaryProps: CompSummary2External;
}

function ResolveComponent({ summaryProps }: ResolveComponentProps) {
  const resolvedComponent = useNode(summaryProps.whatToRender.id);

  if (!resolvedComponent) {
    return null;
  }

  return <ComponentSummary componentNode={resolvedComponent} />;
}

function _SummaryComponent2({ summaryNode }: ISummaryComponent2) {
  // const [lodedLayout, setLodedLayout] = useState<any>();
  // useEffect(() => {
  //   const fetchLayout = async () => {
  //     // console.log('fetching');
  //     // console.log(summaryNode.item.whatToRender.id);
  //     const res = await fetchLayouts(summaryNode.item.whatToRender.id);
  //     // console.log(res);
  //     setLodedLayout(res);
  //   };
  //
  //   if (summaryNode.item.whatToRender.type === 'task' && !lodedLayout) {
  //     fetchLayout();
  //   }
  // }, [lodedLayout, summaryNode.item.whatToRender.id, summaryNode.item.whatToRender.type]);

  if (summaryNode.item.whatToRender.type === 'layoutSet') {
    return <LayoutSetSummary layoutSetId={summaryNode.item.whatToRender.id} />;
  }

  if (summaryNode.item.whatToRender.type === 'page') {
    return <PageSummary pageId={summaryNode.item.whatToRender.id} />;
  }

  if (summaryNode.item.whatToRender.type === 'component') {
    return <ResolveComponent summaryProps={summaryNode.item} />;
  }

  // if (summaryNode.item.whatToRender.type === 'task') {
  //   // Hent: http://local.altinn.cloud/ttd/component-library/api/layouts/form
  //   // Hent: http://local.altinn.cloud/ttd/component-library/instances/501337/6f7c805f-76a5-437a-a437-82e0a6c8500e/data/3a672553-80ea-48d8-ab55-26fd4d3318eb?includeRowId=true&language=nn
  //   console.log(lodedLayout);
  //   if (lodedLayout) {
  //     console.log(JSON.stringify(lodedLayout, null, 2));
  //
  //     // return Object.keys(lodedLayout).map((layoutId) => (
  //     //   <GenericComponentById
  //     //     key={layoutId}
  //     //     id={layoutId}
  //     //   />
  //     // ));
  //
  //     // return Object.keys(lodedLayout).map((layoutId) => (
  //     //   <PageSummary
  //     //     pageId={layoutId}
  //     //     key={layoutId}
  //     //   />
  //     // ));
  //   }
  //
  //   return (
  //     <div>
  //       <h1>One day, I will render an ENTIRE process!</h1>
  //     </div>
  //   );
  // }

  throw new Error(`Invalid summary render type: ${summaryNode.item.whatToRender.type}`);
}
export const SummaryComponent2 = React.forwardRef(_SummaryComponent2);
