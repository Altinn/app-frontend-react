import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';
import { useAttachmentDeletionInRepGroups } from 'src/features/attachments/useAttachmentDeletionInRepGroups';
import { FD } from 'src/features/formData/FormDataWrite';
import { useAsRefObject } from 'src/hooks/useAsRef';
import { useMemoDeepEqual } from 'src/hooks/useStateDeepEqual';
import type { CompGroupRepeatingInternal } from 'src/layout/Group/config.generated';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';

interface RepeatingGroupContext {
  node: LayoutNodeForGroup<CompGroupRepeatingInternal>;

  // If this is true, we're rendering the group for the first time in this context. This is used to
  // determine whether we should open the first/last row for editing when first displaying the group. If, however,
  // we run that effect every time the group is re-rendered, the user would be unable to close the row for editing.
  isFirstRender: boolean;

  // Methods for getting/setting state about which rows are in edit mode
  toggleEditing: (index: number) => void;
  openForEditing: (index: number) => void;
  openNextForEditing: () => void;
  closeForEditing: (index: number) => void;
  isEditing: (index: number) => boolean;
  isEditingAnyRow: boolean;
  editingIndex: number | undefined;

  addRow: () => void;

  deleteRow: (index: number) => Promise<boolean>;
  isDeleting: (index: number) => boolean;

  numVisibleRows: number;
  visibleRowIndexes: number[];
  hiddenRowIndexes: Set<number>;
  moreVisibleRowsAfterEditIndex: boolean;
}

const { Provider, useCtx } = createContext<RepeatingGroupContext>({
  name: 'RepeatingGroup',
  required: true,
});

function usePureStates(node: LayoutNodeForGroup<CompGroupRepeatingInternal>) {
  const editingAll = node.item.edit?.mode === 'showAll';
  const editingNone = node.item.edit?.mode === 'onlyTable';
  const binding = node.item.dataModelBindings?.group;

  const [visibleRowIndexes, hiddenRowIndexes] = useMemoDeepEqual(() => {
    const hidden: number[] = [];
    const visible: number[] = [];
    for (const [index, row] of node.item.rows.entries()) {
      if (row.groupExpressions?.hiddenRow) {
        hidden.push(index);
      } else {
        visible.push(index);
      }
    }

    return [visible, new Set(hidden)];
  }, [node.item.rows]);

  const [isFirstRender, setIsFirstRender] = useState(true);
  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined);
  const [deletingIndexes, setDeletingIndexes] = useState<number[]>([]);

  return {
    editingAll,
    editingNone,
    numVisibleRows: visibleRowIndexes.length,
    hiddenRowIndexes,
    visibleRowIndexes,
    isFirstRender,
    editingIndex,
    setEditingIndex,
    deletingIndexes,
    setDeletingIndexes,
    binding,
  };
}

function useRepeatingGroupState(node: LayoutNodeForGroup<CompGroupRepeatingInternal>): RepeatingGroupContext {
  const appendToList = FD.useAppendToList();
  const removeIndexFromList = FD.useRemoveIndexFromList();
  const { onBeforeRowDeletion } = useAttachmentDeletionInRepGroups(node);
  const pureStates = usePureStates(node);
  const {
    editingAll,
    editingNone,
    binding,
    setDeletingIndexes,
    deletingIndexes,
    visibleRowIndexes,
    editingIndex,
    setEditingIndex,
  } = useAsRefObject(pureStates);

  // Figure out if the row we were editing is now hidden, and in that case, reset the editing state
  useEffect(() => {
    if (pureStates.editingIndex !== undefined && pureStates.hiddenRowIndexes.has(pureStates.editingIndex)) {
      setEditingIndex.current(undefined);
    }
  }, [pureStates.editingIndex, pureStates.hiddenRowIndexes, node, setEditingIndex]);

  const toggleEditing = useCallback(
    (index: number) => {
      if (editingAll.current || editingNone.current) {
        return;
      }
      setEditingIndex.current((prev) => (prev === index ? undefined : index));
    },
    [editingAll, editingNone, setEditingIndex],
  );

  const openForEditing = useCallback(
    (index: number) => {
      if (editingAll.current || editingNone.current) {
        return;
      }
      setEditingIndex.current(index);
    },
    [editingAll, editingNone, setEditingIndex],
  );

  const openNextForEditing = useCallback(() => {
    if (editingAll.current || editingNone.current) {
      return;
    }
    setEditingIndex.current((prev) => {
      if (prev === undefined) {
        return visibleRowIndexes.current[0];
      }
      const isLast = prev === visibleRowIndexes.current[visibleRowIndexes.current.length - 1];
      if (isLast) {
        return undefined;
      }
      return visibleRowIndexes.current[visibleRowIndexes.current.indexOf(prev) + 1];
    });
  }, [editingAll, editingNone, setEditingIndex, visibleRowIndexes]);

  const closeForEditing = useCallback(
    (index: number) => {
      if (editingAll.current || editingNone.current) {
        return;
      }
      setEditingIndex.current((prev) => (prev === index ? undefined : prev));
    },
    [editingAll, editingNone, setEditingIndex],
  );

  const isEditing = useCallback(
    (index: number) => {
      if (editingAll.current) {
        return true;
      }
      if (editingNone.current) {
        return false;
      }
      return editingIndex.current === index;
    },
    [editingAll, editingIndex, editingNone],
  );

  const addRow = useCallback(() => {
    if (binding.current) {
      appendToList({
        path: binding.current,
        newValue: {},
      });
      openForEditing(node.item.rows.length);
    }
  }, [appendToList, binding, node.item.rows.length, openForEditing]);

  const deleteRow = useCallback(
    async (index: number) => {
      setDeletingIndexes.current((prev) => {
        if (prev.includes(index)) {
          return prev;
        }
        return [...prev, index];
      });
      const attachmentDeletionSuccessful = await onBeforeRowDeletion(index);
      if (attachmentDeletionSuccessful && binding.current) {
        removeIndexFromList({
          path: binding.current,
          index,
        });

        setEditingIndex.current((prev) => {
          if (prev === index) {
            return undefined;
          }
          return prev;
        });
        setDeletingIndexes.current((prev) => {
          const idx = prev.indexOf(index);
          if (idx === -1) {
            return prev;
          }
          return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
        });

        return true;
      }

      return false;
    },
    [binding, onBeforeRowDeletion, removeIndexFromList, setDeletingIndexes, setEditingIndex],
  );

  const isDeleting = useCallback((index: number) => deletingIndexes.current.includes(index), [deletingIndexes]);

  const moreVisibleRowsAfterEditIndex = useMemo(() => {
    if (pureStates.editingIndex === undefined) {
      return false;
    }
    return pureStates.visibleRowIndexes.indexOf(pureStates.editingIndex) < pureStates.visibleRowIndexes.length - 1;
  }, [pureStates.visibleRowIndexes, pureStates.editingIndex]);

  return {
    node,
    isFirstRender: pureStates.isFirstRender,
    toggleEditing,
    openForEditing,
    openNextForEditing,
    closeForEditing,
    isEditing,
    isEditingAnyRow: pureStates.editingAll
      ? true
      : pureStates.editingNone
        ? false
        : pureStates.editingIndex !== undefined,
    editingIndex: pureStates.editingIndex,
    numVisibleRows: pureStates.numVisibleRows,
    visibleRowIndexes: pureStates.visibleRowIndexes,
    hiddenRowIndexes: pureStates.hiddenRowIndexes,
    moreVisibleRowsAfterEditIndex,
    addRow,
    deleteRow,
    isDeleting,
  };
}

interface Props {
  node: LayoutNodeForGroup<CompGroupRepeatingInternal>;
}

export function RepeatingGroupProvider({ node, children }: PropsWithChildren<Props>) {
  const state = useRepeatingGroupState(node);
  return <Provider value={state}>{children}</Provider>;
}

export const useRepeatingGroup = () => useCtx();
