import React from 'react';
import { useParams } from 'react-router-dom';

import { useEngine } from 'libs/FormEngineReact';
import { RenderLayout } from 'libs/FormEngineReact/components';

export type PageParams = {
  pageId: string;
};

export const Page = () => {
  console.log('Page: Starting with FormEngine hook');

  const { pageId } = useParams<PageParams>() as Required<PageParams>;
  const engine = useEngine();

  console.log('Page: Getting layout for pageId:', pageId);

  // Get layout from FormEngine instead of old stores
  const currentPageLayout = engine?.layout.getVisibleComponents(pageId);

  // debugger;

  if (!currentPageLayout || currentPageLayout.length === 0) {
    console.log('Page: No layout found for pageId:', pageId);
    return <div>No layout found for page: {pageId}</div>;
  }

  console.log('Page: Rendering layout with', currentPageLayout.length, 'components');

  return <RenderLayout components={currentPageLayout} />;
};
