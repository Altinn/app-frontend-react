import React, { useCallback } from 'react';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';

import { createContext } from 'src/core/contexts/context';
import { createZustandContext } from 'src/core/contexts/zustandContext';
import { useAttachmentDeletionInRepGroups } from 'src/features/attachments/useAttachmentDeletionInRepGroups';
import { FD } from 'src/features/formData/FormDataWrite';
import { useOnGroupCloseValidation } from 'src/features/validation/callbacks/onGroupCloseValidation';
import { useOnDeleteGroupRow } from 'src/features/validation/validationContext';
import { useAsRef } from 'src/hooks/useAsRef';
import { useWaitForState } from 'src/hooks/useWaitForState';
import { OpenByDefaultProvider } from 'src/layout/RepeatingGroup/OpenByDefaultProvider';
import type { CompRepeatingGroupInternal } from 'src/layout/RepeatingGroup/config.generated';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

interface Store {
  editingAll: boolean;
  editingNone: boolean;
  binding: string;

  // If this is true, we're rendering the group for the first time in this context. This is used to
  // determine whether we should open the first/last row for editing when first displaying the group. If, however,
  // we run that effect every time the group is re-rendered, the user would be unable to close the row for editing.
  isFirstRender: boolean;

  visibleRowIndexes: number[];
  hiddenRowIndexes: Set<number>;

  editingIndex: number | undefined;
  editableRowIndexes: number[];
  deletableRowIndexes: number[];
  deletingIndexes: number[];
  addingIndexes: number[];
}

interface ZustandHiddenMethods {
  updateNode: (n: BaseLayoutNode<CompRepeatingGroupInternal>) => void;
  startAddingRow: (idx: number) => void;
  startDeletingRow: (idx: number) => void;
  endDeletingRow: (idx: number, successful: boolean) => void;
}

interface ExtendedMethods {
  // Methods for getting/setting state about which rows are in edit mode
  toggleEditing: (index: number) => void;
  openForEditing: (index: number) => void;
  openNextForEditing: () => void;
  closeForEditing: (index: number) => void;
}

type AddRowResult =
  | { result: 'stoppedByBinding'; index: undefined }
  | { result: 'stoppedByValidation'; index: undefined }
  | { result: 'addedAndOpened' | 'addedAndHidden'; index: number };

interface ContextMethods extends ExtendedMethods {
  addRow: () => Promise<AddRowResult>;
  deleteRow: (index: number) => Promise<boolean>;
  isEditing: (index: number) => boolean;
  isDeleting: (index: number) => boolean;
}

type ZustandState = Store & ZustandHiddenMethods & Omit<ExtendedMethods, 'toggleEditing'>;
type ExtendedContext = ContextMethods & Props;

const ZStore = createZustandContext({
  name: 'RepeatingGroupZ',
  required: true,
  initialCreateStore: newStore,
  onReRender: (store, { node }) => {
    store.getState().updateNode(node);
  },
});

const ExtendedStore = createContext<ExtendedContext>({
  name: 'RepeatingGroup',
  required: true,
});

function newStore({ node }: Props) {
  return createStore<ZustandState>((set) => {
    function produceRowIndexes(n: BaseLayoutNode<CompRepeatingGroupInternal>) {
      const hidden: number[] = [];
      const visible: number[] = [];
      const editable: number[] = [];
      const deletable: number[] = [];
      for (const row of n.item.rows) {
        if (row.groupExpressions?.hiddenRow) {
          hidden.push(row.index);
        } else {
          visible.push(row.index);

          // Only the visible rows can be edited or deleted
          if (row.groupExpressions?.edit?.editButton !== false) {
            editable.push(row.index);
          }
          if (row.groupExpressions?.edit?.deleteButton !== false) {
            deletable.push(row.index);
          }
        }
      }

      return [visible, new Set(hidden), editable, deletable] as const;
    }

    const [visibleRowIndexes, hiddenRowIndexes, editableRowIndexes, deletableRowIndexes] = produceRowIndexes(node);

    return {
      editingAll: node.item.edit?.mode === 'showAll',
      editingNone: node.item.edit?.mode === 'onlyTable',
      binding: node.item.dataModelBindings.group,
      isFirstRender: true,
      editingIndex: undefined,
      numVisibleRows: visibleRowIndexes.length,
      deletingIndexes: [],
      addingIndexes: [],

      visibleRowIndexes,
      hiddenRowIndexes,
      editableRowIndexes,
      deletableRowIndexes,

      closeForEditing: (idx) => {
        set((state) => {
          if (state.editingIndex === idx) {
            return { editingIndex: undefined };
          }
          return state;
        });
      },

      openForEditing: (idx) => {
        set((state) => {
          if (state.editingIndex === idx || state.editingAll || state.editingNone) {
            return state;
          }
          if (!state.editableRowIndexes.includes(idx)) {
            return state;
          }
          return { editingIndex: idx };
        });
      },

      openNextForEditing: () => {
        set((state) => {
          if (state.editingAll || state.editingNone) {
            return state;
          }
          if (state.editingIndex === undefined) {
            return { editingIndex: state.editableRowIndexes[0] };
          }
          const isLast = state.editingIndex === state.editableRowIndexes[state.editableRowIndexes.length - 1];
          if (isLast) {
            return { editingIndex: undefined };
          }
          return { editingIndex: state.editableRowIndexes[state.editableRowIndexes.indexOf(state.editingIndex) + 1] };
        });
      },

      startAddingRow: (idx) => {
        set((state) => {
          if (state.addingIndexes.includes(idx)) {
            return state;
          }
          return { addingIndexes: [...state.addingIndexes, idx], editingIndex: undefined };
        });
      },

      startDeletingRow: (idx) => {
        set((state) => {
          if (state.deletingIndexes.includes(idx)) {
            return state;
          }
          return { deletingIndexes: [...state.deletingIndexes, idx] };
        });
      },

      endDeletingRow: (idx, successful) => {
        set((state) => {
          const isEditing = state.editingIndex === idx;
          const i = state.deletingIndexes.indexOf(idx);
          if (i === -1 && !isEditing) {
            return state;
          }
          if (isEditing && successful) {
            return { editingIndex: undefined };
          }
          return {
            deletingIndexes: [...state.deletingIndexes.slice(0, i), ...state.deletingIndexes.slice(i + 1)],
            editingIndex: isEditing && successful ? undefined : state.editingIndex,
          };
        });
      },

      updateNode: (n: BaseLayoutNode<CompRepeatingGroupInternal>) => {
        const [visibleRowIndexes, hiddenRowIndexes, editableRowIndexes, deletableRowIndexes] = produceRowIndexes(n);
        set((state) => {
          const newState: Partial<ZustandState> = {
            binding: n.item.dataModelBindings.group,
            visibleRowIndexes,
            hiddenRowIndexes,
            editableRowIndexes,
            deletableRowIndexes,
          };
          if (state.editingIndex !== undefined && !visibleRowIndexes.includes(state.editingIndex)) {
            newState.editingIndex = undefined;
          }
          if (state.isFirstRender) {
            newState.isFirstRender = false;
          }

          // If the rows have been added, we can remove them from the addingIndexes list. The same thing
          // happens for the deletingIndexes list via the endDeletingRow method.
          const allRowIndexes = n.item.rows.map((row) => row.index);
          const recentlyAddedIndexes = state.addingIndexes.filter((idx) => allRowIndexes.includes(idx));
          if (recentlyAddedIndexes.length > 0) {
            newState.addingIndexes = state.addingIndexes.filter((idx) => !recentlyAddedIndexes.includes(idx));
          }

          return newState;
        });
      },
    };
  });
}

function useExtendedRepeatingGroupState(node: BaseLayoutNode<CompRepeatingGroupInternal>): ExtendedContext {
  const nodeRef = useAsRef(node);
  const stateRef = useAsRef(ZStore.useSelector((state) => state));

  const appendToList = FD.useAppendToList();
  const removeIndexFromList = FD.useRemoveIndexFromList();
  const onBeforeRowDeletion = useAttachmentDeletionInRepGroups(node);
  const onDeleteGroupRow = useOnDeleteGroupRow();
  const onGroupCloseValidation = useOnGroupCloseValidation();
  const waitForNode = useWaitForState(nodeRef);

  const maybeValidateRow = useCallback(() => {
    const { editingAll, editingIndex, editingNone } = stateRef.current;
    const validateOnSaveRow = nodeRef.current.item.validateOnSaveRow;
    if (!validateOnSaveRow || editingAll || editingNone || editingIndex === undefined) {
      return Promise.resolve(false);
    }
    return onGroupCloseValidation(nodeRef.current, editingIndex, validateOnSaveRow);
  }, [nodeRef, onGroupCloseValidation, stateRef]);

  const openForEditing = useCallback(
    async (index: number) => {
      if (await maybeValidateRow()) {
        return;
      }
      stateRef.current.openForEditing(index);
    },
    [maybeValidateRow, stateRef],
  );

  const openNextForEditing = useCallback(async () => {
    if (await maybeValidateRow()) {
      return;
    }
    stateRef.current.openNextForEditing();
  }, [maybeValidateRow, stateRef]);

  const closeForEditing = useCallback(
    async (index: number) => {
      if (await maybeValidateRow()) {
        return;
      }
      stateRef.current.closeForEditing(index);
    },
    [maybeValidateRow, stateRef],
  );

  const toggleEditing = useCallback(
    async (index: number) => {
      if (await maybeValidateRow()) {
        return;
      }
      const { editingIndex, closeForEditing, openForEditing } = stateRef.current;
      if (editingIndex === index) {
        closeForEditing(index);
      } else {
        openForEditing(index);
      }
    },
    [maybeValidateRow, stateRef],
  );

  const isEditing = useCallback(
    (index: number) => {
      const { editingAll, editingIndex, editingNone } = stateRef.current;
      if (editingAll) {
        return true;
      }
      if (editingNone) {
        return false;
      }
      return editingIndex === index;
    },
    [stateRef],
  );

  const addRow = useCallback(async (): Promise<AddRowResult> => {
    const { binding, startAddingRow } = stateRef.current;
    if (!binding) {
      return { result: 'stoppedByBinding', index: undefined };
    }
    if (await maybeValidateRow()) {
      return { result: 'stoppedByValidation', index: undefined };
    }
    const nextIndex = nodeRef.current.item.rows.length;
    startAddingRow(nextIndex);
    appendToList({
      path: binding,
      newValue: {},
    });
    await waitForNode((node) => node.item.rows.some((row) => row.index === nextIndex));
    if (stateRef.current.visibleRowIndexes.includes(nextIndex)) {
      await openForEditing(nextIndex);
      return { result: 'addedAndOpened', index: nextIndex };
    }

    return { result: 'addedAndHidden', index: nextIndex };
  }, [appendToList, maybeValidateRow, nodeRef, openForEditing, stateRef, waitForNode]);

  const deleteRow = useCallback(
    async (index: number) => {
      const { binding, deletableRowIndexes, startDeletingRow, endDeletingRow } = stateRef.current;
      if (!deletableRowIndexes.includes(index)) {
        return false;
      }

      startDeletingRow(index);
      const attachmentDeletionSuccessful = await onBeforeRowDeletion(index);
      if (attachmentDeletionSuccessful && binding) {
        onDeleteGroupRow(nodeRef.current, index);
        removeIndexFromList({
          path: binding,
          index,
        });

        endDeletingRow(index, true);
        return true;
      }

      endDeletingRow(index, false);
      return false;
    },
    [nodeRef, onBeforeRowDeletion, onDeleteGroupRow, removeIndexFromList, stateRef],
  );

  const isDeleting = useCallback((index: number) => stateRef.current.deletingIndexes.includes(index), [stateRef]);

  return {
    node,
    addRow,
    deleteRow,
    isDeleting,
    closeForEditing,
    isEditing,
    openForEditing,
    openNextForEditing,
    toggleEditing,
  };
}

function ProvideTheRest({ node, children }: PropsWithChildren<Props>) {
  const extended = useExtendedRepeatingGroupState(node);
  return <ExtendedStore.Provider value={extended}>{children}</ExtendedStore.Provider>;
}

interface Props {
  node: BaseLayoutNode<CompRepeatingGroupInternal>;
}

export function RepeatingGroupProvider({ node, children }: PropsWithChildren<Props>) {
  return (
    <ZStore.Provider node={node}>
      <ProvideTheRest node={node}>
        <OpenByDefaultProvider node={node}>{children}</OpenByDefaultProvider>
      </ProvideTheRest>
    </ZStore.Provider>
  );
}

export const useRepeatingGroup = () => ExtendedStore.useCtx();
export const useRepeatingGroupNode = () => ExtendedStore.useCtx().node;
export function useRepeatingGroupSelector<T>(selector: (state: Store) => T): T {
  return ZStore.useMemoSelector(selector);
}
