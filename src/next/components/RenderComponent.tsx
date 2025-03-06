import React, { memo } from 'react';

import dot from 'dot-object';
import { useStore } from 'zustand';

import { Flex } from 'src/app-components/Flex/Flex';
import { Input } from 'src/app-components/Input/Input';
import { Label } from 'src/app-components/Label/Label';
import classes from 'src/layout/GenericComponent.module.css';
import { RepeatingGroupNext } from 'src/next/components/RepeatingGroupNext';
import { layoutStore } from 'src/next/stores/layoutStore';
import { textResourceStore } from 'src/next/stores/textResourceStore';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RenderComponentType {
  component: ResolvedCompExternal;
  parentBinding?: string;
  itemIndex?: number;
  childField?: string;
}

export const RenderComponent = memo(function RenderComponent({
  component,
  parentBinding,
  itemIndex,
  childField,
}: RenderComponentType) {
  const setDataValue = useStore(layoutStore, (state) => state.setDataValue);
  const binding =
    !parentBinding && component.dataModelBindings && component.dataModelBindings['simpleBinding']
      ? component.dataModelBindings['simpleBinding']
      : `${parentBinding}[${itemIndex}]${childField}`;

  const value = useStore(layoutStore, (state) => (binding ? dot.pick(binding, state.data) : undefined));

  const textResource = useStore(textResourceStore, (state) =>
    component.textResourceBindings && component.textResourceBindings['title'] && state.textResource?.resources
      ? // @ts-ignore
        state.textResource.resources.find((r) => r.id === component.textResourceBindings['title']) //dot.pick(component.textResourceBindings['title'], state.textResource)
      : undefined,
  );
  if (component.type === 'Paragraph') {
    return <p key={component.id}>{textResource?.value}</p>;
  }

  if (component.type === 'Header') {
    return <h1 key={component.id}>{textResource?.value}</h1>;
  }

  if (component.type === 'Input') {
    return (
      <Flex
        key={component.id}
        className={classes.container}
      >
        <div
          className={classes.md}
          style={{ display: 'flex' }}
        >
          <Label label={textResource?.value || ''} />
          <Input
            value={value}
            onChange={(e) => {
              if (binding) {
                // @ts-ignore
                setDataValue(binding, e.target.value);
              }
            }}
          />
        </div>
      </Flex>
    );
  }

  if (component.type === 'RepeatingGroup') {
    return <RepeatingGroupNext component={component} />;
  }

  return (
    <div key={component.id}>
      {component.id} type: {component.type}
    </div>
  );
});
