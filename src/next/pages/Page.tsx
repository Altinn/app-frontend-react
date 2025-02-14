import React from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import { dataStore } from 'src/next/stores/dataStore';
import { layoutStore } from 'src/next/stores/layoutStore';

type PageParams = {
  pageId: string;
};

export const Page = () => {
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  const { layouts } = useStore(layoutStore);

  const { data, setDataValue } = useStore(dataStore);

  const currentPage = layouts[pageId];

  if (!currentPage) {
    throw new Error(`could not find layout: ${currentPage}`);
  }

  return (
    <div>
      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}

      {currentPage.data.layout
        // eslint-disable-next-line no-prototype-builtins
        .filter((component) => component.dataModelBindings?.hasOwnProperty('simpleBinding'))
        .map((component) => (
          <input
            key={component.id}
            type='text'
            name='test'
            onChange={(event) => {
              // @ts-ignore
              setDataValue(component.dataModelBindings.simpleBinding, event.target.value);
            }}
          />
        ))}

      {/*{currentPage.data.layout.map((component) => (*/}
      {/*  <div key={component.id}>*/}
      {/*    <p>{component.type}</p>*/}
      {/*    <p>{component.id}</p>*/}
      {/*    <pre>{JSON.stringify(component, null, 2)}</pre>*/}
      {/*  </div>*/}
      {/*))}*/}
    </div>
  );
};
