import React from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import classes from 'src/components/presentation/Presentation.module.css';
import { RenderMainLayout } from 'src/next/components/RenderLayout';
import { megaStore } from 'src/next/stores/megaStore';

type PageParams = {
  pageId: string;
};

export const Page = () => {
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  const resolvedLayouts = useStore(megaStore, (state) => state.layouts);

  if (!resolvedLayouts) {
    throw new Error(`could not find layout`);
  }

  const currentPage = resolvedLayouts[pageId];

  if (!currentPage) {
    throw new Error(`could not find layout: ${currentPage}`);
  }
  const currentPageLayout =
    currentPage.data && currentPage.data.layout ? resolvedLayouts[pageId].data.layout : undefined;

  if (!currentPageLayout) {
    return null;
  }

  return (
    <div className={classes.container}>
      <div className={classes.page}>
        <section
          id='main-content'
          className={classes.modal}
          tabIndex={-1}
        >
          <div className={classes.modalBody}>
            <RenderMainLayout components={currentPageLayout} />
          </div>
        </section>
      </div>
    </div>
  );
};
