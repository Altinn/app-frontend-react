import React from 'react';

import dot from 'dot-object';
import { useStore } from 'zustand/index';

import { RenderLayout } from 'src/next/components/RenderLayout';
import { layoutStore } from 'src/next/stores/layoutStore';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RepeatingGroupNextType {
  component: ResolvedCompExternal;
}

export const RepeatingGroupNext: React.FunctionComponent<RepeatingGroupNextType> = ({ component }) => {
  const value = useStore(layoutStore, (state) =>
    component.dataModelBindings && component.dataModelBindings['group']
      ? dot.pick(component.dataModelBindings['group'], state.data)
      : undefined,
  );

  if (!Array.isArray(value)) {
    throw new Error('rep group should have array');
  }

  if (component.children === undefined) {
    return null;
  }

  const parentBinding =
    component.dataModelBindings && component.dataModelBindings['group']
      ? component.dataModelBindings['group']
      : undefined;

  return (
    <div style={{ backgroundColor: 'lightblue' }}>
      {value.map((value, idx) => (
        <div key={idx}>
          <RenderLayout
            components={component.children}
            parentBinding={parentBinding}
            itemIndex={idx}
          />
        </div>
      ))}
    </div>
  );
};
