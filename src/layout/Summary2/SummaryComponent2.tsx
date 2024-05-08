import React from 'react';

import { useGetPage, useResolvedNode } from 'src/utils/layout/NodesContext';
import type { IGrid } from 'src/layout/common.generated';
import type { GenericComponentOverrideDisplay } from 'src/layout/FormComponentContext';
import type { CompInternal, CompTypes } from 'src/layout/layout';
import type { SummaryDisplayProperties } from 'src/layout/Summary/config.generated';
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

export interface RenderSummary2Props<Type extends CompTypes> {
  node: LayoutNode<Type>;
  overrideItemProps?: Partial<Omit<CompInternal<Type>, 'id'>>;
  overrideDisplay?: GenericComponentOverrideDisplay;
}

function RenderSummary2<RenderSummary2Props>({ node }) {
  console.log('node', node);
  const targetNode = useResolvedNode(node);
  console.log('targetNode', targetNode);
  if (!targetNode) {
    return null;
  }
  // const component = targetNode.def;
  // const RenderSummary2Function =
  //   'renderSummary2' in component ? (component.renderSummary2.bind(component) as React.ElementType) : null;

  return <>{node.def.renderSummary2(targetNode)}</>;

  // if (RenderSummary2Function) {
  //   return <RenderSummary2Function />;
  // }
  //
  // return <div></div>;
}

function _SummaryComponent2({ summaryNode, overrides }: ISummaryComponent2, ref: React.Ref<HTMLDivElement>) {
  // console.log('summaryNode.children()');
  // console.log(summaryNode.children());

  // const layoutSets = useLayoutSets();
  // console.log(layoutSets);

  //useSelector

  //const page = useNodesMemoSelector();
  //const targetNode = useResolvedNode(overrides?.targetNode || summaryNode.item.componentRef || summaryNode.item.id);

  const pageId = summaryNode?.item?.pageId;

  const page = useGetPage(pageId);

  if (!page) {
    return null;
  }

  return (
    <div>
      {page.children().map((childNode: LayoutNode) => {
        console.log('childNode', childNode);

        if (childNode.def.renderSummary2) {
          return (
            <RenderSummary2
              node={childNode}
              key={childNode.item.id}
            ></RenderSummary2>
          ); //childNode.def.renderSummary2({ targetNode });
        }
        // }

        return <div />;
      })}
    </div>
  );
  // return (
  //   <div>
  //     {summaryNode.children().map((childNode) => (
  //       <GenericComponent
  //         key={childNode.item.id}
  //         node={childNode}
  //       />
  //     ))}
  //   </div>
  // );
}
export const SummaryComponent2 = React.forwardRef(_SummaryComponent2);
