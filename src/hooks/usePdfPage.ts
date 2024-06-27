import { useMemo } from 'react';

import { useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { usePdfFormatQuery } from 'src/features/pdf/usePdfFormatQuery';
import { usePageOrder } from 'src/hooks/useNavigatePage';
import { getComponentDef } from 'src/layout';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import { generateHierarchy } from 'src/utils/layout/HierarchyGenerator';
import { Hidden, useNodes } from 'src/utils/layout/NodesContext';
import { useNodeTraversal, useNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { ExpressionDataSources } from 'src/features/expressions/ExprContext';
import type { IPdfFormat } from 'src/features/pdf/types';
import type { CompInstanceInformationExternal } from 'src/layout/InstanceInformation/config.generated';
import type { ILayout } from 'src/layout/layout';
import type { CompSummaryExternal } from 'src/layout/Summary/config.generated';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { NodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';

const PDF_LAYOUT_NAME = '__pdf__';

export const usePdfPage = (): LayoutPage | undefined => {
  const layoutPages = useNodes();
  const pageOrder = usePageOrder();
  const dataSources = useExpressionDataSources();
  const pdfLayoutName = useLayoutSettings().pages.pdfLayoutName;
  const isHiddenPage = Hidden.useIsHiddenPageSelector();
  const customPdfPage = useNodeTraversal((t) => t.findPage(pdfLayoutName));
  const method = customPdfPage ? 'custom' : 'auto';
  const traversal = useNodeTraversalSelector();

  const { data: pdfFormat, isFetching: pdfFormatIsLoading } = usePdfFormatQuery(method === 'auto');

  const readyForPrint = !!layoutPages && !pdfFormatIsLoading;

  const automaticPdfPage = useMemo(() => {
    if (readyForPrint && method === 'auto') {
      return generateAutomaticPage(pdfFormat!, pageOrder, isHiddenPage, layoutPages!, dataSources, traversal);
    }
    return null;
  }, [readyForPrint, method, pdfFormat, pageOrder, layoutPages, dataSources, isHiddenPage, traversal]);

  if (!readyForPrint) {
    return undefined;
  }

  if (method === 'custom') {
    return customPdfPage!;
  }

  return automaticPdfPage!;
};

function generateAutomaticPage(
  pdfFormat: IPdfFormat,
  pageOrder: string[],
  isHiddenPage: ReturnType<typeof Hidden.useIsHiddenPageSelector>,
  layoutPages: LayoutPages,
  dataSources: ExpressionDataSources,
  traversal: NodeTraversalSelector,
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
  const allPages = traversal((t) => t.children(), []);
  const filteredSortedPages = allPages
    .filter((p) => !excludedPages.has(p.pageKey) && !isHiddenPage(p) && pageOrder?.includes(p.pageKey))
    .sort((pA, pB) => (pageOrder ? pageOrder.indexOf(pA.pageKey) - pageOrder.indexOf(pB.pageKey) : 0));
  const nodes = traversal((t) => filteredSortedPages.map((p) => t.with(p).children()).flat(), filteredSortedPages);
  const nodesFiltered = nodes.filter((n) => !excludedComponents.has(n.id));

  for (const node of nodesFiltered) {
    if (node.def.shouldRenderInAutomaticPDF(node as any, dataSources)) {
      automaticPdfLayout.push({
        id: `__pdf__${node.id}`,
        type: 'Summary',
        componentRef: node.id,
        excludedChildren: pdfFormat?.excludedComponents,
        grid: dataSources.nodeDataSelector((picker) => picker(node)?.item?.grid, [node]),
        largeGroup: node.isType('Group'),
      } as CompSummaryExternal);
    }
  }

  // Generate the hierarchy for the automatic PDF layout
  const pdfPage = generateHierarchy(automaticPdfLayout, dataSources, getComponentDef);
  pdfPage.registerCollection(PDF_LAYOUT_NAME, layoutPages);
  return pdfPage;
}
