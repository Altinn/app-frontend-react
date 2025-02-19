import React from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import { RenderLayout } from 'src/next/components/RenderLayout';
import { layoutStore } from 'src/next/stores/layoutStore';

type PageParams = {
  pageId: string;
};

export const Page = () => {
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  const { resolvedLayouts, layouts } = useStore(layoutStore);
  if (!layouts) {
    return;
  }
  const currentPage = resolvedLayouts[pageId];

  if (!currentPage) {
    throw new Error(`could not find layout: ${currentPage}`);
  }
  const currentPageLayout =
    resolvedLayouts && resolvedLayouts[pageId] && resolvedLayouts[pageId].data && resolvedLayouts[pageId].data.layout
      ? resolvedLayouts[pageId].data.layout
      : undefined;

  if (!currentPageLayout) {
    return null;
  }

  return <RenderLayout components={currentPageLayout} />;
};
