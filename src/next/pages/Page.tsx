import React from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'zustand';

//import { dataStore } from 'src/next/stores/dataStore';
import { layoutStore } from 'src/next/stores/layoutStore';

type PageParams = {
  pageId: string;
};

export const Page = () => {
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  const { resolvedLayouts, layouts, data, setDataValue } = useStore(layoutStore);

  //const { data, setDataValue } = useStore(dataStore);

  // const resolvedLayout = resolvedLayouts[pageId];
  //
  // console.log(JSON.stringify(resolvedLayout, null, 2));

  const currentPage = layouts[pageId];

  if (!currentPage) {
    throw new Error(`could not find layout: ${currentPage}`);
  }

  // if (!data) {
  //   throw new Error('no data');
  // }

  const filteredEntries = data
    ? Object.entries(data).filter(([, value]) => typeof value === 'string' && value.length > 0)
    : [];

  return (
    <div>
      <div style={{ backgroundColor: 'lightgray' }}>
        <h3>Datamodel fields</h3>

        {filteredEntries.map(([key, value]) => (
          <div key={key}>
            {key}: {JSON.stringify(value, null, 2)}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {currentPage.data.layout
          // eslint-disable-next-line no-prototype-builtins
          .filter((component) => component.dataModelBindings?.hasOwnProperty('simpleBinding'))
          .map((component) => {
            // @ts-ignore
            const datamodelBinding = component.dataModelBindings.simpleBinding;
            return (
              <div
                key={component.id}
                style={{ backgroundColor: 'darkgrey', margin: '10px' }}
              >
                {component.hidden && <pre>{JSON.stringify(component.hidden, null, 2)}</pre>}

                <div>
                  <strong>DatamodelBinding: </strong>
                  {datamodelBinding}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label htmlFor={component.id}>{component.id}</label>
                  <input
                    id={component.id}
                    type='text'
                    name='test'
                    onChange={(event) => {
                      setDataValue(datamodelBinding, event.target.value);
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
