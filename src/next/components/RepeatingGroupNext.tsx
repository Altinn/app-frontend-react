import React from 'react';

import dot from 'dot-object';
import { useStore } from 'zustand/index';

import { RenderSubLayout } from 'src/next/components/RenderLayout';
import { layoutStore } from 'src/next/stores/layoutStore';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RepeatingGroupNextType {
  component: ResolvedCompExternal;
}

export const RepeatingGroupNext: React.FunctionComponent<RepeatingGroupNextType> = ({ component }) => {
  const numRows = useStore(layoutStore, (state) => {
    const maybeArray =
      component.dataModelBindings && component.dataModelBindings['group']
        ? dot.pick(component.dataModelBindings['group'], state.data)
        : undefined;

    if (Array.isArray(maybeArray)) {
      return maybeArray.length;
    }

    throw new Error('rep group should have array');
  });

  if (component.children === undefined) {
    return null;
  }

  const parentBinding =
    component.dataModelBindings && component.dataModelBindings['group']
      ? component.dataModelBindings['group']
      : undefined;

  return (
    <div style={{ backgroundColor: 'lightblue' }}>
      {Array.from({ length: numRows }, (_, idx) => (
        <RenderSubLayout
          key={idx}
          components={component.children}
          parentBinding={parentBinding}
          itemIndex={idx}
        />
      ))}
    </div>
  );
};
