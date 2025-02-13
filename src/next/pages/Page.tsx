import React from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import { layoutStore } from 'src/next/stores/layoutStore';

type PageParams = {
  pageId: string;
};

export const Page = () => {
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  const layouts = useStore(layoutStore);

  const currentLayout = layouts.layouts['RadioButtonsPage'];

  console.log(JSON.stringify(layouts.layouts, null, 2));

  console.log('pageId', pageId);

  if (!currentLayout) {
    throw new Error(`could not find layout: ${pageId}`);
  }

  return (
    <div>
      <h1>Page</h1>
      <h2>{pageId}</h2>

      {/*<pre>{JSON.stringify(layouts.layouts, null, 2)}</pre>*/}

      {currentLayout.data.layout.map((component) => (
        <div key={component.id}>{component.id}</div>
      ))}

      {/*<pre>{JSON.stringify(currentLayout, null, 2)}</pre>*/}
    </div>
  );
};
