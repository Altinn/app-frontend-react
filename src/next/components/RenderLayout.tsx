import React from 'react';

import dot from 'dot-object';
import { useStore } from 'zustand/index';

import { resolveText } from 'src/next/components/resolveText';
import { layoutStore } from 'src/next/stores/layoutStore';
import { textResourceStore } from 'src/next/stores/textResourceStore';
import type { CompExternal } from 'src/layout/layout';

interface RenderLayoutType {
  components: CompExternal[];
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

        if (currentComponent.type === 'RepeatingGroup') {
          const binding = currentComponent.dataModelBindings.group;
          // @ts-ignore
          const dataToDisplay = dot.pick(binding, data);
          if (!dataToDisplay) {
            return;
          }

          return (
            <div
              key={currentComponent.id}
              style={{ border: '1px solid green' }}
            >
              <h3>Here comes repeating group:</h3>
              {/*<RenderLayout components={children} />*/}
              {/*<h2>Rep group:</h2>*/}
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
  );
};
