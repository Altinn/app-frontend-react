import React from 'react';
import { useParams } from 'react-router-dom';

import dot from 'dot-object';
import { useStore } from 'zustand';

import { RenderLayout } from 'src/next/components/RenderLayout';
import { layoutStore } from 'src/next/stores/layoutStore';

type PageParams = {
  pageId: string;
};

export const Page = () => {
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  const { resolvedLayouts, layouts, data, setDataValue } = useStore(layoutStore);

  if (!layouts) {
    return;
  }

  const currentPage = resolvedLayouts[pageId];

  if (!currentPage) {
    throw new Error(`could not find layout: ${currentPage}`);
  }

  // debugger;

  const currentPageLayout =
    resolvedLayouts && resolvedLayouts[pageId] && resolvedLayouts[pageId].data && resolvedLayouts[pageId].data.layout
      ? resolvedLayouts[pageId].data.layout
      : undefined;

  if (!currentPageLayout) {
    return null;
  }

  const testComp = currentPageLayout.find((comp) => comp.id === '1-1-idtest');

  const testValue = dot.pick('rapport.innsender.foretak.organisasjonsnummer', data);

  return (
    <div>
      <h1>testValue</h1>
      <div>{testValue}</div>
      <h1>testComp</h1>
      {testComp && <pre>{JSON.stringify(testComp, null, 2)}</pre>}
      {resolvedLayouts && (
        <div>
          {resolvedLayouts &&
            resolvedLayouts[pageId] &&
            resolvedLayouts[pageId].data &&
            resolvedLayouts[pageId].data.layout && <RenderLayout components={resolvedLayouts[pageId].data.layout} />}
        </div>
      )}
      {/*<h1>resolvedLayouts</h1>*/}
      {/*{resolvedLayouts && (*/}
      {/*  <div>*/}
      {/*    {resolvedLayouts && resolvedLayouts?.data && resolvedLayouts?.data[pageId] && (*/}
      {/*      <pre>{JSON.stringify(resolvedLayouts.data[pageId], null, 2)}</pre>*/}
      {/*    )}*/}
      {/*  </div>*/}
      {/*)}*/}
      {/*<div style={{ display: 'flex', flexDirection: 'column' }}>*/}
      {/*  <pre>{JSON.stringify(currentPage.data.layout, null, 2)}</pre>*/}
      {/*  {currentPage.data.layout*/}
      {/*    // eslint-disable-next-line no-prototype-builtins*/}
      {/*    .filter((component) => component.dataModelBindings?.hasOwnProperty('simpleBinding'))*/}
      {/*    .filter((component) => {*/}
      {/*      if (!resolvedLayouts || !resolvedLayouts[pageId]) {*/}
      {/*        return true;*/}
      {/*      }*/}
      {/*      const resolved = resolvedLayouts[pageId].data.layout.find(*/}
      {/*        (resolvedComponent) => resolvedComponent.id === component.id,*/}
      {/*      );*/}
      {/*      return !resolved?.hidden;*/}
      {/*    })*/}
      {/*    .map((component) => {*/}
      {/*      // @ts-ignore*/}
      {/*      const datamodelBinding = component.dataModelBindings.simpleBinding;*/}
      {/*      return (*/}
      {/*        <div*/}
      {/*          key={component.id}*/}
      {/*          style={{ backgroundColor: 'darkgrey', margin: '10px' }}*/}
      {/*        >*/}
      {/*          {component.hidden && <pre>{JSON.stringify(component.hidden, null, 2)}</pre>}*/}
      {/*          <div>*/}
      {/*            <strong>DatamodelBinding: </strong>*/}
      {/*            {datamodelBinding}*/}
      {/*          </div>*/}
      {/*          <div>*/}
      {/*            <strong>Type: </strong>*/}
      {/*            {component.type}*/}
      {/*          </div>*/}
      {/*          <div style={{ display: 'flex', flexDirection: 'column' }}>*/}
      {/*            <label htmlFor={component.id}>{component.id}</label>*/}
      {/*            <input*/}
      {/*              id={component.id}*/}
      {/*              type='text'*/}
      {/*              name='test'*/}
      {/*              onChange={(event) => {*/}
      {/*                setDataValue(datamodelBinding, event.target.value);*/}
      {/*              }}*/}
      {/*            />*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      );*/}
      {/*    })}*/}
      {/*</div>*/}
    </div>
  );
};
