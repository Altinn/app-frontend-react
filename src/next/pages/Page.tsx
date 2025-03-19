import React from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import classes from 'src/components/presentation/Presentation.module.css';
import { RenderLayout } from 'src/next/components/RenderLayout';
import { layoutStore } from 'src/next/stores/layoutStore';

type PageParams = {
  pageId: string;
};

export const Page = () => {
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  // const resolvedLayouts = useStore(layoutStore, (state) => state.layouts);

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
