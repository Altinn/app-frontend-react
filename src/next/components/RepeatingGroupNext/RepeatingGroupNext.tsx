import React, { useRef } from 'react';

import { Button } from '@digdir/designsystemet-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import dot from 'dot-object';
import { useStore } from 'zustand';

import { RenderLayout } from 'src/next/components/RenderLayout';
import classes from 'src/next/components/RepeatingGroupNext/RepeatingGroupNext.module.css';
import { layoutStore } from 'src/next/stores/layoutStore';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';
interface RepeatingGroupNextType {
  component: ResolvedCompExternal;
  parentBinding?: string;
  itemIndex?: number;
}
//     background-color: var(--repeating-group-edit-surface-color);
export const RepeatingGroupNext: React.FC<RepeatingGroupNextType> = ({ component, parentBinding, itemIndex }) => {
  // @ts-ignore
  const binding = component.dataModelBindings?.group;
  if (!binding) {
    throw new Error('Tried to render repeating group without datamodel binding');
  }

  const groupArray = useStore(layoutStore, (state) => dot.pick(binding, state.data)) || [];

  const addRow = useStore(layoutStore, (state) => state.addRow);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: groupArray.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // just a rough estimate
    overscan: 2,
    measureElement: (element, entry, instance) => element.getBoundingClientRect().height,
  });
  if (!component.children || !Array.isArray(component.children)) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div
        ref={parentRef}
        className={classes.container}
        style={{
          width: '100%',
          height: '500px',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
            width: '100%',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const index = virtualRow.index;
            return (
              <div
                key={index}
                ref={(el) => {
                  if (el) {
                    rowVirtualizer.measureElement(el);
                  }
                }}
                data-index={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${groupArray[virtualRow.index]}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <RenderLayout
                  components={component.children}
                  parentBinding={binding}
                  itemIndex={index}
                />
              </div>
            );
          })}
        </div>
      </div>
      <Button
        onClick={() => {
          addRow(binding, parentBinding, itemIndex);
        }}
      >
        Til rad
      </Button>
    </div>
  );
};
