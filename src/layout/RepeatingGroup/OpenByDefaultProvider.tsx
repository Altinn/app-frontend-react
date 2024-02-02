import React, { useEffect, useRef } from 'react';
import type { PropsWithChildren } from 'react';

import { useRepeatingGroup, useRepeatingGroupSelector } from 'src/layout/RepeatingGroup/RepeatingGroupContext';
import type { CompRepeatingGroupInternal } from 'src/layout/RepeatingGroup/config.generated';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

interface Props {
  node: BaseLayoutNode<CompRepeatingGroupInternal>;
}

export function OpenByDefaultProvider({ node, children }: PropsWithChildren<Props>) {
  const openByDefault = node.item.edit?.openByDefault;
  const { addRow, openForEditing } = useRepeatingGroup();
  const { editingIndex, isFirstRender, visibleRowIndexes } = useRepeatingGroupSelector((state) => ({
    editingIndex: state.editingIndex,
    isFirstRender: state.isFirstRender,
    visibleRowIndexes: state.visibleRowIndexes,
  }));

  const numRows = visibleRowIndexes.length;
  const firstIndex = visibleRowIndexes[0];
  const lastIndex = visibleRowIndexes[numRows - 1];

  // Making sure we don't add a row while we're already adding one
  const working = useRef(false);

  // Add new row if openByDefault is true and no rows exist. This also makes sure to add a row immediately after the
  // last one has been deleted.
  useEffect((): void => {
    if (openByDefault && numRows === 0 && !working.current) {
      working.current = true;
      addRow().then(() => {
        working.current = false;
      });
    }
  }, [node, addRow, openByDefault, numRows]);

  // Open the first or last row for editing, if openByDefault is set to 'first' or 'last'
  useEffect((): void => {
    if (
      isFirstRender &&
      openByDefault &&
      typeof openByDefault === 'string' &&
      ['first', 'last'].includes(openByDefault) &&
      editingIndex === undefined
    ) {
      const index = openByDefault === 'last' ? lastIndex : firstIndex;
      openForEditing(index);
    }
  }, [openByDefault, editingIndex, isFirstRender, firstIndex, lastIndex, openForEditing]);

  return <>{children}</>;
}
