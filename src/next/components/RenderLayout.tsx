import React from 'react';

import { useStore } from 'zustand/index';

import { resolveText } from 'src/next/components/resolveText';
import { layoutStore } from 'src/next/stores/layoutStore';
import { textResourceStore } from 'src/next/stores/textResourceStore';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RenderLayoutType {
  components: ResolvedCompExternal[];
}

export const RenderLayout: React.FunctionComponent<RenderLayoutType> = ({ components }) => {
  const { textResource } = useStore(textResourceStore);

  const { data, setDataValue } = useStore(layoutStore);

  return (
    <div>
      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}

      {components.map((currentComponent) => {
        if (currentComponent.type === 'Paragraph') {
          const paragraphText = resolveText(currentComponent, textResource);
          return <p key={currentComponent.id}>{paragraphText}</p>;
        }

        if (currentComponent.type === 'Header') {
          const paragraphText = resolveText(currentComponent, textResource);
          return <h1 key={currentComponent.id}>{paragraphText}</h1>;
        }

        if (currentComponent.type === 'Input') {
          const datamodelBinding = currentComponent.dataModelBindings.simpleBinding;
          return (
            <div key={currentComponent.id}>
              <label htmlFor=''>{currentComponent.id}</label>
              <input
                onChange={(event) => {
                  // @ts-ignore
                  datamodelBinding && setDataValue(datamodelBinding, event.target.value);
                }}
              />
            </div>
          );
        }

        if (
          currentComponent.type === 'RepeatingGroup' &&
          currentComponent.children &&
          currentComponent.children.length > 0
        ) {
          const rows = currentComponent.children.map((currentChild, idx) => (
            <RenderLayout
              key={idx}
              // @ts-ignore
              components={currentChild}
            />
          ));
          return (
            <div
              key={currentComponent.id}
              style={{ border: '1px solid green' }}
            >
              {rows}
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
  );
};
