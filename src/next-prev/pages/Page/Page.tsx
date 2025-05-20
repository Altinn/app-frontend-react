import React from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { RenderLayout } from 'src/next-prev/components/RenderLayout';
import { layoutStore } from 'src/next-prev/stores/layoutStore';

export type PageParams = {
  pageId: string;
};

export const Page = () => {
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  const currentPage = useStore(
    layoutStore,
    useShallow((state) => state.layouts?.[pageId]),
  );

  if (!currentPage) {
    throw new Error(`could not find layout`);
  }
  if (!currentPage) {
    // In production, you might prefer graceful handling rather than throwing
    throw new Error(`No layout found for page: ${pageId}`);
  }

  const currentPageLayout = currentPage.data?.layout;
  if (!currentPageLayout) {
    return null;
  }

  return <RenderLayout components={currentPageLayout} />;
};
