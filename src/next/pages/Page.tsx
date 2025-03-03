import React from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import classes from 'src/components/presentation/Presentation.module.css';
import { RenderLayout } from 'src/next/components/RenderLayout';
import { layoutStore } from 'src/next/stores/layoutStore';

type PageParams = {
  pageId: string;
};

export const Page = () => {
  console.log('halla');
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  const resolvedLayouts = useStore(layoutStore, (state) => state.resolvedLayouts);

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

  return (
    <div className={classes.container}>
      <div className={classes.page}>
        <section
          id='main-content'
          className={classes.modal}
          tabIndex={-1}
        >
          <div className={classes.modalBody}>
            <RenderLayout components={currentPageLayout} />
          </div>
        </section>
      </div>
    </div>
  );
};
