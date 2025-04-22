import React from 'react';

import classNames from 'classnames';

import { Flex } from 'src/app-components/Flex/Flex';
import { gridToClasses } from 'src/layout/GenericComponent';
import classes from 'src/layout/GenericComponent.module.css';
import { RenderComponent } from 'src/next/components/RenderComponent';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RenderLayoutType {
  components?: ResolvedCompExternal[];
  parentBinding?: string;
  itemIndex?: number;
}

const getBinding = (component: ResolvedCompExternal): string | undefined => {
  if (component.type === 'RepeatingGroup') {
    // @ts-ignore
    return component.dataModelBindings['group'];
  }

  return component.dataModelBindings && component.dataModelBindings['simpleBinding']
    ? component.dataModelBindings['simpleBinding']
    : undefined;
};

export const RenderLayout: React.FunctionComponent<RenderLayoutType> = ({ components, parentBinding, itemIndex }) => {
  if (!components) {
    return null;
  }

  return (
    <Flex
      container
      spacing={6}
      alignItems='flex-start'
    >
      {components.map((currentComponent) => {
        // const childMapping = currentComponent.dataModelBindings
        //   ? currentComponent.dataModelBindings['simpleBinding']
        //   : '';

        const childMapping = getBinding(currentComponent);

        const childField = childMapping && parentBinding ? childMapping.replace(parentBinding, '') : undefined;
        const id = `item-${currentComponent.id}`;

        return (
          <Flex
            data-componentbaseid={id}
            data-componentid={id}
            data-componenttype={currentComponent.type}
            item
            container
            size={currentComponent.grid}
            key={`grid-${id}`}
            className={classNames(classes.container, gridToClasses(currentComponent.grid?.labelGrid, classes))}
          >
            {/*<pre>{JSON.stringify(currentComponent.type, null, 2)}</pre>*/}
            {/*<h4>Here comes the layout</h4>*/}

            {/*<ul>*/}
            {/*  <li>childMapping: {childMapping}</li>*/}
            {/*  <li>childField: {childField}</li>*/}
            {/*</ul>*/}

            <RenderComponent
              component={currentComponent}
              parentBinding={parentBinding}
              itemIndex={itemIndex}
              childField={childField}
            />
          </Flex>
        );
      })}
    </Flex>
  );
};
