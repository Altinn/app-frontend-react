import React from 'react';

import { useResolvedNode } from 'src/utils/layout/NodesContext';
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
  const targetNode = useResolvedNode(node);
  if (!targetNode) {
    return null;
  }
  return <>{node.def.renderSummary2(targetNode)}</>;
}

const getIdOfNodeToRender = (summaryNode) => {};

function _SummaryComponent2({ summaryNode, overrides }: ISummaryComponent2, ref: React.Ref<HTMLDivElement>) {
  // const pageId = summaryNode?.item?.pageId;
  // const nodesContext = useContext();

  // // @ts-ignore
  // useStore((state) => {
  //   console.log(state);
  //   return {} as unknown;
  // });
  return <div></div>;
  // initialCreateStore((state) => ({
  //   nodes: state.nodes,
  // })),

  // const { count, increment, decrement } = useStore((state) => ({
  //   count: state.count,
  //   increment: state.increment,
  //   decrement: state.decrement,
  // }));

  //
  // const store = useContext(NodesContext);
  // const thing = useSelector()
  // let nodeToRender: LayoutNode;
  // const page = useGetPage(summaryNode.item?.whatToRender.id);
  // if (summaryNode.item?.whatToRender?.type === 'page') {
  //   console.log('page!');
  //
  //   nodeToRender = useGetPage(summaryNode.item?.whatToRender);
  // }
  // const layoutSetId = summaryNode?.item?.layoutSetId;
  // if (layoutSetId && pageId) {
  //   throw new Error();
  // }
  // const page = useGetPage(pageId);
  // if (!page) {
  //   return null;
  // }
  // return (
  //   <div>
  //     {page.children().map((childNode: LayoutNode) => {
  //       if (childNode.def.renderSummary2) {
  //         return (
  //           <RenderSummary2
  //             node={childNode}
  //             key={childNode.item.id}
  //           ></RenderSummary2>
  //         );
  //       }
  //     })}
  //   </div>
  // );
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
