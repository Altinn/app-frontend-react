import React from 'react';

import dot from 'dot-object';
import { useStore } from 'zustand/index';

import { RenderLayout } from 'src/next/components/RenderLayout';
import { megaStore } from 'src/next/stores/megaStore';
import type { ResolvedCompExternal } from 'src/next/stores/megaStore';

interface RepeatingGroupNextType {
  component: ResolvedCompExternal;
}

export const RepeatingGroupNext: React.FunctionComponent<RepeatingGroupNextType> = ({ component }) => {
  const addRow = megaStore.getState().addRow;
  const groupBinding = component.dataModelBindings && component.dataModelBindings['group'];
  const numRows = useStore(megaStore, (state) => {
    const maybeArray = groupBinding ? dot.pick(groupBinding, state.data) : undefined;
    if (Array.isArray(maybeArray)) {
      return maybeArray.length;
    }

    throw new Error('rep group should have array');
  });

  if (component.children === undefined) {
    return null;
  }

  return (
    <div style={{ backgroundColor: 'lightblue' }}>
      {Array.from({ length: numRows }, (_, idx) => (
        <RenderLayout
          key={idx}
          components={component.children}
          parentBinding={groupBinding}
          itemIndex={idx}
        />
      ))}
      <button
        onClick={() => addRow(groupBinding)}
        style={{ display: 'block', margin: 'auto', marginTop: '1rem', width: '100%', padding: '1rem' }}
      >
        Legg til ny
      </button>
    </div>
  );
};
