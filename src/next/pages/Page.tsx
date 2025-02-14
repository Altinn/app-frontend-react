import React from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import { layoutStore } from 'src/next/stores/layoutStore';

type PageParams = {
  pageId: string;
};

export const Page = () => {
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  const { layouts } = useStore(layoutStore);

  const currentPage = layouts[pageId];

  if (!currentPage) {
    throw new Error(`could not find layout: ${currentPage}`);
  }

  return (
    <div>
      {currentPage.data.layout.map((component) => (
        <div key={component.id}>
          <p>{component.type}</p>
          <p>{component.id}</p>
          <pre>{JSON.stringify(component, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};
