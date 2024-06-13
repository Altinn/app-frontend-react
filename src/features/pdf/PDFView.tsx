import React from 'react';

import { usePageNavigationConfig } from 'src/features/form/layout/PageNavigationContext';
import { usePdfFormatQuery } from 'src/features/pdf/usePdfFormatQuery';
import { CompCategory } from 'src/layout/common';
import { GenericComponent } from 'src/layout/GenericComponent';
import { GroupComponent } from 'src/layout/Group/GroupComponent';
import { InstanceInformationComponent2 } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { SummaryComponent2 } from 'src/layout/Summary2/SummaryComponent2';
import { useNode, useNodes } from 'src/utils/layout/NodesContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const PDFComponent = ({ node }: { node: LayoutNode }) => {
  // console.log('type', node.isType('Summary2'));
  // console.log('node', node);

  // console.log(node);

  // return <div>{node.item.type}</div>;
  //
  // if (node.item.renderSummary2) {
  //   const renderedComponent = node.item.renderSummary2();
  //   return <>{renderedComponent}</>;
  // }
  const originalNode = useNode(node.item.id);

  if (originalNode?.def?.renderSummary2) {
    console.log('originalNode', originalNode);
    //return <Summa.
    //
    //
    //
    //
    //
    //
    //
    // ryComponent2 summaryNode={node as LayoutNode<'Summary2'>}></SummaryComponent2>;

    return <>{originalNode.def?.renderSummary2(node as LayoutNode<any>)}</>;
    // if (node.def?.renderSummary2) {
    //   console.log('node', node);
    // }
  }

  if (node.isType('Summary') || ('renderAsSummary' in node.item && node.item.renderAsSummary)) {
    return (
      <SummaryComponent
        summaryNode={node as LayoutNode<'Summary'>}
        overrides={{
          display: { hideChangeButton: true, hideValidationMessages: true },
        }}
      />
    );
  }

  if (node.isType('Group')) {
    // Support grouping of summary components
    return (
      <GroupComponent
        groupNode={node}
        renderLayoutNode={(child: LayoutNode) => (
          <PDFComponent
            key={child.item.id}
            node={child}
          />
        )}
      />
    );
  }

  if (node.isCategory(CompCategory.Presentation)) {
    return (
      <GenericComponent
        node={node}
        overrideItemProps={{
          grid: { xs: 12 },
        }}
      />
    );
  }

  window.logWarnOnce(`Component type: "${node.item.type}" is not allowed in PDF. Component id: "${node.item.id}"`);
  return null;
};

export const PDFView = () => {
  const nodes = useNodes();
  const pageNavigationConfig = usePageNavigationConfig();
  const { data: pdfSettings, isFetching: pdfFormatIsLoading } = usePdfFormatQuery(true);
  if (pdfFormatIsLoading) {
    return null;
  }

  const pdfPage = nodes
    .allPageKeys()
    .filter((pageKey) => !pdfSettings?.excludedPages.includes(pageKey))
    .filter((pageKey) => !pageNavigationConfig.isHiddenPage(pageKey))
    .filter((pageKey) => pageNavigationConfig.order?.includes(pageKey))
    .sort(([pA], [pB]) =>
      pageNavigationConfig.order ? pageNavigationConfig.order.indexOf(pA) - pageNavigationConfig.order.indexOf(pB) : 0,
    )
    .flatMap((layoutPage) => {
      const currentLayout = nodes.findLayout(layoutPage);
      return currentLayout
        ?.children()
        .filter((node) => !pdfSettings?.excludedComponents.includes(node.item.id))
        .filter((node) => node.def.shouldRenderInAutomaticPDF(node as any))
        .map((node) => {
          if (node.def.renderSummary2) {
            return (
              <SummaryComponent2
                key={node.item.id}
                summaryNode={
                  {
                    item: {
                      type: 'Summary2',
                      whatToRender: {
                        type: 'component',
                        id: node.item.id,
                      },
                      childComponents: [],
                      id: node.item.id,
                    },
                  } as any
                }
              />
            );
          }
          return (
            <SummaryComponent
              key={node.item.id}
              summaryNode={node as LayoutNode<'Summary'>}
              overrides={{
                display: { hideChangeButton: true, hideValidationMessages: true },
              }}
            />
          );
        });
    });

  return (
    <>
      <InstanceInformationComponent2
        type={'InstanceInformation'}
        id={'__pdf__instance-information'}
        elements={{
          dateSent: true,
          sender: true,
          receiver: true,
          referenceNumber: true,
        }}
        pageBreak={{
          breakAfter: 'always',
        }}
        textResourceBindings={undefined}
      />
      {pdfPage}
    </>
  );
};
