import { useMemo } from 'react';

import { useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { usePdfFormatQuery } from 'src/features/pdf/usePdfFormatQuery';
import { usePageOrder } from 'src/hooks/useNavigatePage';
import { getComponentDef } from 'src/layout';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import { generateHierarchy } from 'src/utils/layout/HierarchyGenerator';
import { Hidden, useNodes } from 'src/utils/layout/NodesContext';
import type { ExpressionDataSources } from 'src/features/expressions/ExprContext';
import type { IPdfFormat } from 'src/features/pdf/types';
import type { CompInstanceInformationExternal } from 'src/layout/InstanceInformation/config.generated';
import type { ILayout } from 'src/layout/layout';
import type { CompSummaryExternal } from 'src/layout/Summary/config.generated';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

const PDF_LAYOUT_NAME = '__pdf__';

export const usePdfPage = (): LayoutPage | null => {
  const layoutPages = useNodes();
  const pageOrder = usePageOrder();
  const dataSources = useExpressionDataSources();
  const pdfLayoutName = useLayoutSettings().pages.pdfLayoutName;
  const isHiddenPage = Hidden.useIsHiddenPageSelector();

  const customPdfPage = pdfLayoutName ? layoutPages.findLayout(pdfLayoutName) : undefined;
  const method = customPdfPage ? 'custom' : 'auto';

  const { data: pdfFormat, isFetching: pdfFormatIsLoading } = usePdfFormatQuery(method === 'auto');

  const readyForPrint = !!layoutPages && !pdfFormatIsLoading;

  const automaticPdfPage = useMemo(() => {
    if (readyForPrint && method === 'auto') {
      return generateAutomaticPage(pdfFormat!, pageOrder, isHiddenPage, layoutPages!, dataSources);
    }
    return null;
  }, [readyForPrint, method, pdfFormat, pageOrder, layoutPages, dataSources, isHiddenPage]);

  if (!readyForPrint) {
    return null;
  }

  if (method === 'custom') {
    return customPdfPage!;
  } else {
    return automaticPdfPage!;
  }
};

function generateAutomaticPage(
  pdfFormat: IPdfFormat,
  pageOrder: string[],
  isHiddenPage: (pageId: string) => boolean,
  layoutPages: LayoutPages,
  dataSources: ExpressionDataSources,
): LayoutPage {
  const automaticPdfLayout: ILayout = [];

  // Add instance information
  const instanceInformation: CompInstanceInformationExternal = {
    id: '__pdf__instance-information',
    type: 'InstanceInformation',
    elements: {
      dateSent: true,
      sender: true,
      receiver: true,
      referenceNumber: true,
    },
    pageBreak: {
      breakAfter: 'always',
    },
  };
  automaticPdfLayout.push(instanceInformation);

  const excludedPages = new Set(pdfFormat?.excludedPages);
  const excludedComponents = new Set(pdfFormat?.excludedComponents);

  // Iterate over all pages, and add all components that should be included in the automatic PDF as summary components
  Object.entries(layoutPages.all())
    .filter(([pageName]) => !excludedPages.has(pageName) && !isHiddenPage(pageName) && pageOrder?.includes(pageName))
    .sort(([pA], [pB]) => (pageOrder ? pageOrder.indexOf(pA) - pageOrder.indexOf(pB) : 0))
    .flatMap(([_, layoutPage]) => layoutPage.children().filter((node) => !excludedComponents.has(node.getId())))
    .map((node) => {
      if (node.def.shouldRenderInAutomaticPDF(node as any)) {
        return {
          id: `__pdf__${node.getId()}`,
          type: 'Summary',
          componentRef: node.getId(),
          excludedChildren: pdfFormat?.excludedComponents,
          grid: node.item.grid,
          largeGroup: node.isType('Group'),
        } as CompSummaryExternal;
      }
      return null;
    })
    .forEach((summaryComponent) => {
      if (summaryComponent !== null) {
        automaticPdfLayout.push(summaryComponent);
      }
    });

  // Generate the hierarchy for the automatic PDF layout
  const pdfPage = generateHierarchy(automaticPdfLayout, dataSources, getComponentDef);
  pdfPage.registerCollection(PDF_LAYOUT_NAME, layoutPages);
  return pdfPage;
}
