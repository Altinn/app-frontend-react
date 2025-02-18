import React from 'react';
import { useParams } from 'react-router-dom';

import dot from 'dot-object';
import { useStore } from 'zustand';

import { layoutStore } from 'src/next/stores/layoutStore';
import { textResourceStore } from 'src/next/stores/textResourceStore';
import type { CompExternal } from 'src/layout/layout';
import type { TextResource } from 'src/next/app/api';

type PageParams = {
  pageId: string;
};

function resolveText(component: CompExternal, textResource?: TextResource) {
  // if (component.type !== 'Paragraph') {
  //   return null;
  // }
  if (!textResource?.resources) {
    return null;
  }
  // @ts-ignore
  if (!component.textResourceBindings?.title) {
    return null;
  }

  // @ts-ignore
  const foundText = textResource.resources.find((r) => r.id === component.textResourceBindings!.title);
  if (!foundText) {
    return null;
  }

  return <p key={component.id}>{foundText.value}</p>;
}

export const Page = () => {
  const { pageId } = useParams<PageParams>() as Required<PageParams>;

  const { resolvedLayouts, layouts, data, setDataValue } = useStore(layoutStore);

  const { textResource, setTextResource } = useStore(textResourceStore);

  console.log(JSON.stringify(textResource, null, 2));

  if (resolvedLayouts && resolvedLayouts[pageId]) {
    console.log(
      'resolvedLayouts',
      resolvedLayouts[pageId].data.layout.find((layout) => layout.id === 'InputPage-Input'),
    );
  }

  if (!layouts) {
    return;
  }

  const currentPage = resolvedLayouts[pageId];

  if (!currentPage) {
    throw new Error(`could not find layout: ${currentPage}`);
  }

  return (
    <div>
      {resolvedLayouts && (
        <div>
          {resolvedLayouts &&
            resolvedLayouts[pageId] &&
            resolvedLayouts[pageId].data &&
            resolvedLayouts[pageId].data.layout &&
            resolvedLayouts[pageId].data.layout.map((currentComponent) => {
              if (currentComponent.type === 'Paragraph') {
                const paragraphText = resolveText(currentComponent, textResource);
                return <p key={currentComponent.id}>{paragraphText}</p>;
              }

              if (currentComponent.type === 'Header') {
                const paragraphText = resolveText(currentComponent, textResource);
                return <h1 key={currentComponent.id}>{paragraphText}</h1>;
              }

              if (currentComponent.type === 'Input') {
                return <input key={currentComponent.id} />;
              }

              if (currentComponent.type === 'RepeatingGroup') {
                const binding = currentComponent.dataModelBindings.group;

                console.log('binding', binding);

                // @ts-ignore
                const dataToDisplay = dot.pick(binding, data);
                if (!dataToDisplay) {
                  return;
                }

                return (
                  <div key={currentComponent.id}>
                    <h2>Rep group:</h2>
                    <pre>{JSON.stringify(currentComponent, null, 2)}</pre>
                  </div>
                );
              }

              return (
                <div key={currentComponent.id}>
                  {currentComponent.id} type: {currentComponent.type}
                </div>
              );
            })}
        </div>
      )}

      <h1>resolvedLayouts</h1>

      {resolvedLayouts && (
        <div>
          {resolvedLayouts && resolvedLayouts?.data && resolvedLayouts?.data[pageId] && (
            <pre>{JSON.stringify(resolvedLayouts.data[pageId], null, 2)}</pre>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <pre>{JSON.stringify(currentPage.data.layout, null, 2)}</pre>

        {currentPage.data.layout
          // eslint-disable-next-line no-prototype-builtins
          .filter((component) => component.dataModelBindings?.hasOwnProperty('simpleBinding'))

          .filter((component) => {
            if (!resolvedLayouts || !resolvedLayouts[pageId]) {
              return true;
            }

            const resolved = resolvedLayouts[pageId].data.layout.find(
              (resolvedComponent) => resolvedComponent.id === component.id,
            );
            return !resolved?.hidden;
          })

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

                <div>
                  <strong>Type: </strong>
                  {component.type}
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
