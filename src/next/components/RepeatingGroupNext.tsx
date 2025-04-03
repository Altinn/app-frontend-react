import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import type { ListChildComponentProps } from 'react-window';

import dot from 'dot-object';
import { useStore } from 'zustand';

import { RenderLayout } from 'src/next/components/RenderLayout';
import { layoutStore } from 'src/next/stores/layoutStore';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RepeatingGroupNextType {
  component: ResolvedCompExternal;
}

export const RepeatingGroupNext: React.FC<RepeatingGroupNextType> = ({ component }) => {
  // Grab the array from data using the group binding

  // component.dataModelBindings?.group

  // @ts-ignore
  const binding = component.dataModelBindings?.group;

  if (!binding) {
    throw new Error('Tried to render repeating group without datamodel binding');
  }

  const groupArray = useStore(layoutStore, (state) => dot.pick(binding, state.data));

  // @ts-ignore
  const parentBinding = component.dataModelBindings?.group;

  // Row renderer for each item in the group
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => (
      <div style={style}>
        <RenderLayout
          components={component.children!}
          parentBinding={parentBinding}
          itemIndex={index}
        />
      </div>
    ),
    [component.children, parentBinding],
  );
  if (!Array.isArray(groupArray)) {
    throw new Error('Repeating group data must be an array');
  }

  if (!component.children || !Array.isArray(component.children)) {
    return null;
  }

  return (
    <div style={{ backgroundColor: 'lightblue' }}>
      <List
        height={2000} // total visible height of the list
        width='100%' // can be a number or string
        itemCount={groupArray.length}
        itemSize={900} // fixed row height in px
        // overscanCount={2}       // optional: how many extra items to render offscreen
      >
        {Row}
      </List>
    </div>
  );
};
