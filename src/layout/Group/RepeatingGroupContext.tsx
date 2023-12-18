import React, { useCallback, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';
import { useAttachmentDeletionInRepGroups } from 'src/features/attachments/useAttachmentDeletionInRepGroups';
import type { CompGroupRepeatingInternal } from 'src/layout/Group/config.generated';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';

interface RepeatingGroupContext {
  node: LayoutNodeForGroup<CompGroupRepeatingInternal>;

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
}

const { Provider, useCtx } = createContext<RepeatingGroupContext>({
  name: 'RepeatingGroup',
  required: true,
});

function useRepeatingGroupState(node: LayoutNodeForGroup<CompGroupRepeatingInternal>): RepeatingGroupContext {
  const editingAll = node.item.edit?.mode === 'showAll';
  const editingNone = node.item.edit?.mode === 'onlyTable';
  const numRows = node.item.rows.length;

  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined);
  const [deletingIndexes, setDeletingIndexes] = useState<number[]>([]);
  const { onBeforeRowDeletion } = useAttachmentDeletionInRepGroups(node);

  const toggleEditing = useCallback(
    (index: number) => {
      if (editingAll || editingNone) {
        return;
      }
      setEditingIndex((prev) => (prev === index ? undefined : index));
    },
    [editingAll, editingNone],
  );

  const openForEditing = useCallback(
    (index: number) => {
      if (editingAll || editingNone) {
        return;
      }
      setEditingIndex(index);
    },
    [editingAll, editingNone],
  );

  const openNextForEditing = useCallback(() => {
    if (editingAll || editingNone) {
      return;
    }
    setEditingIndex((prev) => {
      if (prev === undefined) {
        return 0;
      }
      if (prev === numRows - 1) {
        return undefined;
      }
      return prev + 1;
    });
  }, [editingAll, editingNone, numRows]);

  const closeForEditing = useCallback(
    (index: number) => {
      if (editingAll || editingNone) {
        return;
      }
      setEditingIndex((prev) => (prev === index ? undefined : prev));
    },
    [editingAll, editingNone],
  );

  const isEditing = useCallback(
    (index: number) => {
      if (editingAll) {
        return true;
      }
      if (editingNone) {
        return false;
      }
      return editingIndex === index;
    },
    [editingAll, editingIndex, editingNone],
  );

  const addRow = useCallback(() => {
    // TODO: Write to form data
    openForEditing(node.item.rows.length);
  }, [node.item.rows.length, openForEditing]);

  const deleteRow = useCallback(
    async (index: number) => {
      setDeletingIndexes([...deletingIndexes, index]);
      const attachmentDeletionSuccessful = await onBeforeRowDeletion(index);
      if (attachmentDeletionSuccessful) {
        // TODO: Write to form data

        return true;
      }

      return false;
    },
    [deletingIndexes, onBeforeRowDeletion],
  );

  const isDeleting = useCallback((index: number) => deletingIndexes.includes(index), [deletingIndexes]);

  return {
    node,
    toggleEditing,
    openForEditing,
    openNextForEditing,
    closeForEditing,
    isEditing,
    isEditingAnyRow: editingAll ? true : editingNone ? false : editingIndex !== undefined,
    editingIndex,
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
