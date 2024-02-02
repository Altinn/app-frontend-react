import React, { useEffect, useRef } from 'react';
import type { PropsWithChildren } from 'react';

import { useAsRef } from 'src/hooks/useAsRef';
import { useRepeatingGroup, useRepeatingGroupSelector } from 'src/layout/RepeatingGroup/RepeatingGroupContext';
import type { CompRepeatingGroupInternal } from 'src/layout/RepeatingGroup/config.generated';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

interface Props {
  node: BaseLayoutNode<CompRepeatingGroupInternal>;
}

export function OpenByDefaultProvider({ node, children }: PropsWithChildren<Props>) {
  const groupId = node.item.id;
  const openByDefault = node.item.edit?.openByDefault;
  const { addRow, openForEditing } = useRepeatingGroup();
  const state = useRepeatingGroupSelector((state) => ({
    editingIndex: state.editingIndex,
    isFirstRender: state.isFirstRender,
    visibleRowIndexes: state.visibleRowIndexes,
    hiddenRowIndexes: state.hiddenRowIndexes,
    addingIndexes: state.addingIndexes,
  }));

  const stateRef = useAsRef({
    ...state,
    numRows: state.visibleRowIndexes.length,
    firstIndex: state.visibleRowIndexes[0],
    lastIndex: state.visibleRowIndexes[state.visibleRowIndexes.length - 1],
    addRow,
    openForEditing,
    canAddRows: node.item.edit?.addButton ?? true,
  });

  // When this is true, the group won't try to add more rows using openByDefault
  const disabled = useRef(false);

  // Add new row if openByDefault is true and no (visible) rows exist. This also makes sure to add a row
  // immediately after the last one has been deleted.
  useEffect((): void => {
    (async () => {
      const { numRows, canAddRows } = stateRef.current;
      if (openByDefault && numRows === 0 && canAddRows && !disabled.current) {
        const { result } = await addRow();
        if (result !== 'addedAndOpened') {
          disabled.current = true;
          window.logWarn(
            `openByDefault for repeating group '${groupId}' returned '${result}'. You may have rules that make it ` +
              `impossible to add a new blank row, or open the added row for editing, such as a restrictive ` +
              `hiddenRow expression. You probably want to disable openByDefault for this group, as openByDefault ` +
              `might create empty and invisible rows before it will disable itself. openByDefault will be disabled ` +
              'temporarily for this group.',
          );
        }
      }
    })();
  }, [openByDefault, stateRef, addRow, groupId]);

  // Open the first or last row for editing, if openByDefault is set to 'first' or 'last'
  const isFirstRender = state.isFirstRender;
  useEffect((): void => {
    const { editingIndex, firstIndex, lastIndex, openForEditing } = stateRef.current;
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
  }, [openByDefault, isFirstRender, stateRef]);

  return <>{children}</>;
}
