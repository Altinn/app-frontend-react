import React, { useMemo } from 'react';

import { useStore } from 'zustand/index';

import { Flex } from 'src/app-components/Flex/Flex';
import { Input } from 'src/app-components/Input/Input';
import { Label } from 'src/app-components/Label/Label';
import classes from 'src/layout/GenericComponent.module.css';
import { resolveText } from 'src/next/components/resolveText';
import { layoutStore } from 'src/next/stores/layoutStore';
import { textResourceStore } from 'src/next/stores/textResourceStore';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RenderLayoutType {
  components: ResolvedCompExternal[];
}

export const RenderLayout: React.FunctionComponent<RenderLayoutType> = ({ components }) => {
  const { textResource } = useStore(textResourceStore);

  const { setDataValue } = useStore(layoutStore);

  const debouncedSetDataValue = useMemo(() => {
    let timer: number;
    return (binding: string, value: string) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setDataValue(binding, value);
      }, 300);
    };
  }, [setDataValue]);

  return (
    <div>
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
          const paragraphText = resolveText(currentComponent, textResource);
          return (
            <Flex
              key={currentComponent.id}
              className={classes.container}
            >
              <div
                className={classes.md}
                style={{ display: 'flex' }}
              >
                <Label label={paragraphText} />
                <Input
                  value={currentComponent.renderedValue}
                  onChange={(event) => {
                    // @ts-ignore
                    datamodelBinding && debouncedSetDataValue(datamodelBinding, event.target.value);
                  }}
                />
              </div>
            </Flex>
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
