import React from 'react';

import { RenderComponent } from 'src/next/components/RenderComponent';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RenderLayoutType {
  components?: ResolvedCompExternal[];
  parentBinding?: string;
  itemIndex?: number;
}

export const RenderLayout: React.FunctionComponent<RenderLayoutType> = ({ components, parentBinding, itemIndex }) => {
  if (!components) {
    return null;
  }

  return (
    <div>
      {components.map((currentComponent, idx) => {
        const childMapping = currentComponent.dataModelBindings
          ? currentComponent.dataModelBindings['simpleBinding']
          : '';
        const childField = childMapping ? childMapping.replace(parentBinding, '') : undefined;
        return (
          <RenderComponent
            component={currentComponent}
            parentBinding={parentBinding}
            itemIndex={itemIndex}
            childField={childField}
            key={idx}
          />
        );
      })}
    </div>
  );
};
