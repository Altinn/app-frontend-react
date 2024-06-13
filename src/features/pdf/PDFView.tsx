import React from 'react';

import { usePageNavigationConfig } from 'src/features/form/layout/PageNavigationContext';
import { usePdfFormatQuery } from 'src/features/pdf/usePdfFormatQuery';
import { InstanceInformation } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { SummaryComponent2 } from 'src/layout/Summary2/SummaryComponent2';
import { useNodes } from 'src/utils/layout/NodesContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const PDFView = () => {
  const nodes = useNodes();
  const pageNavigationConfig = usePageNavigationConfig();
  const { data: pdfSettings, isFetching: pdfFormatIsLoading } = usePdfFormatQuery(true);
  if (pdfFormatIsLoading) {
    return null;
  }

  const pdfPage = pageNavigationConfig.order
    ?.filter((pageKey) => !pageNavigationConfig.isHiddenPage(pageKey))
    .filter((pageKey) => !pdfSettings?.excludedPages.includes(pageKey))
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
      <InstanceInformation
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
