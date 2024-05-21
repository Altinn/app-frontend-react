import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { v4 as uuidv4 } from 'uuid';
import { createStore } from 'zustand';

import { createContext } from 'src/core/contexts/context';
import { createZustandContext } from 'src/core/contexts/zustandContext';
import { useAttachmentDeletionInRepGroups } from 'src/features/attachments/useAttachmentDeletionInRepGroups';
import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID } from 'src/features/formData/types';
import { useOnGroupCloseValidation } from 'src/features/validation/callbacks/onGroupCloseValidation';
import { useAsRef } from 'src/hooks/useAsRef';
import { OpenByDefaultProvider } from 'src/layout/RepeatingGroup/OpenByDefaultProvider';
import { useNodeItem, useNodeItemRef, useWaitForNodeItem } from 'src/utils/layout/useNodeItem';
import type { CompInternal } from 'src/layout/layout';
import type { IGroupEditProperties } from 'src/layout/RepeatingGroup/config.generated';
import type { RepGroupRow } from 'src/layout/RepeatingGroup/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { BaseRow } from 'src/utils/layout/types';

interface Store {
  editingAll: boolean;
  editingNone: boolean;
  editingId: string | undefined;
  deletingIds: string[];
  addingIds: string[];
  currentPage: number | undefined;
}

interface ZustandHiddenMethods {
  startAddingRow: (uuid: string) => void;
  endAddingRow: (uuid: string) => void;
  startDeletingRow: (uuid: string) => void;
  endDeletingRow: (uuid: string, successful: boolean) => void;
}

interface ExtendedState {
  // If this is true, we're rendering the group for the first time in this context. This is used to
  // determine whether we should open the first/last row for editing when first displaying the group. If, however,
  // we run that effect every time the group is re-rendered, the user would be unable to close the row for editing.
  isFirstRender: boolean;

  // Methods for getting/setting state about which rows are in edit mode
  toggleEditing: (uuid: string) => void;
  openForEditing: (uuid: string) => void;
  openNextForEditing: () => void;
  closeForEditing: (uuid: string) => void;
  changePage: (page: number) => void;
}

type AddRowResult =
  | { result: 'stoppedByBinding'; uuid: undefined; index: undefined }
  | { result: 'stoppedByValidation'; uuid: undefined; index: undefined }
  | ({ result: 'addedAndOpened' | 'addedAndHidden' } & BaseRow);

interface ContextMethods extends ExtendedState {
  addRow: () => Promise<AddRowResult>;
  deleteRow: (uuid: string) => Promise<boolean>;
  isEditing: (uuid: string) => boolean;
  isDeleting: (uuid: string) => boolean;
  changePage: (page: number) => Promise<void>;
  changePageToRow: (uuid: string) => Promise<void>;
}

type ZustandState = Store & ZustandHiddenMethods & Omit<ExtendedState, 'toggleEditing'>;
type ExtendedContext = ContextMethods & Props & NodeState & PaginationState;

const ZStore = createZustandContext({
  name: 'RepeatingGroupZ',
  required: true,
  initialCreateStore: newStore,
});

const ExtendedStore = createContext<ExtendedContext>({
  name: 'RepeatingGroup',
  required: true,
});

interface NodeState {
  numVisibleRows: number;
  visibleRows: BaseRow[];
  hiddenRows: BaseRow[];
  editableRows: BaseRow[];
  deletableRows: BaseRow[];
}

function produceStateFromRows(rows: RepGroupRow[]): NodeState {
  const hidden: BaseRow[] = [];
  const visible: BaseRow[] = [];
  const editable: BaseRow[] = [];
  const deletable: BaseRow[] = [];
  for (const row of rows) {
    const rowObj: BaseRow = {
      index: row.index,
      uuid: row.uuid,
    };

    if (row.groupExpressions?.hiddenRow) {
      hidden.push(rowObj);
    } else {
      visible.push(rowObj);

      // Only the visible rows can be edited or deleted
      if (row.groupExpressions?.edit?.editButton !== false) {
        editable.push(rowObj);
      }
      if (row.groupExpressions?.edit?.deleteButton !== false) {
        deletable.push(rowObj);
      }
    }
  }

  for (const toSort of [visible, hidden, editable, deletable]) {
    // Sort by index
    toSort.sort((a, b) => a.index - b.index);
  }

  return {
    numVisibleRows: visible.length,
    visibleRows: visible,
    hiddenRows: hidden,
    editableRows: editable,
    deletableRows: deletable,
  };
}

type PaginationState =
  | {
      hasPagination: true;
      currentPage: number;
      totalPages: number;
      rowsPerPage: number;
      rowsToDisplay: BaseRow[];
    }
  | {
      hasPagination: false;
      currentPage: undefined;
      totalPages: undefined;
      rowsPerPage: undefined;
      rowsToDisplay: BaseRow[];
    };

/**
 * Produces the current pagination state if relevant
 */
function producePaginationState(
  currentPage: number | undefined,
  pagination: CompInternal<'RepeatingGroup'>['pagination'],
  visibleRows: BaseRow[],
): PaginationState {
  if (typeof currentPage !== 'number' || !pagination) {
    return {
      hasPagination: false,
      currentPage: undefined,
      totalPages: undefined,
      rowsPerPage: undefined,
      rowsToDisplay: visibleRows,
    };
  }

  const rowsPerPage = pagination.rowsPerPage;
  const totalPages = Math.ceil(visibleRows.length / rowsPerPage);

  const start = currentPage * rowsPerPage;
  const end = (currentPage + 1) * rowsPerPage;

  const rowsToDisplay = visibleRows.slice(start, end);

  return {
    hasPagination: true,
    currentPage,
    totalPages,
    rowsPerPage,
    rowsToDisplay,
  };
}

/**
 * Gets the pagination page for a given row
 * Will return undefined if pagination is not used or the row is not visible
 */
function getPageForRow(rowId: string, paginationState: PaginationState, visibleRows: BaseRow[]): number | undefined {
  if (!paginationState.hasPagination) {
    return undefined;
  }
  const index = visibleRows.findIndex((row) => row.uuid == rowId);
  if (index < 0) {
    return undefined;
  }
  const newPage = Math.floor(index / paginationState.rowsPerPage);

  return newPage != paginationState.currentPage ? newPage : undefined;
}

/**
 * Used for navigating to the correct pagination page when opening a row for editing
 * If the repeating group does not use pagination this will have no effect
 */
function gotoPageForRow(
  rowId: string,
  paginationState: PaginationState,
  visibleRows: BaseRow[],
): { currentPage: number } | undefined {
  const newPage = getPageForRow(rowId, paginationState, visibleRows);
  return newPage != null ? { currentPage: newPage } : undefined;
}

interface NewStoreProps {
  rowsRef: React.MutableRefObject<RepGroupRow[]>;
  editMode: IGroupEditProperties['mode'];
  pagination: CompInternal<'RepeatingGroup'>['pagination'];
}

function newStore({ editMode, pagination, rowsRef }: NewStoreProps) {
  return createStore<ZustandState>((set) => ({
    editingAll: editMode === 'showAll',
    editingNone: editMode === 'onlyTable',
    isFirstRender: true,
    editingIndex: undefined,
    editingId: undefined,
    deletingIds: [],
    addingIds: [],
    currentPage: pagination ? 0 : undefined,

    closeForEditing: (uuid) => {
      set((state) => {
        if (state.editingId === uuid) {
          return { editingId: undefined };
        }
        return state;
      });
    },

    openForEditing: (uuid) => {
      set((state) => {
        if (state.editingId === uuid || state.editingAll || state.editingNone) {
          return state;
        }
        const { editableRows, visibleRows } = produceStateFromRows(rowsRef.current);
        if (!editableRows.some((row) => row.uuid === uuid)) {
          return state;
        }
        const paginationState = producePaginationState(state.currentPage, pagination, visibleRows);
        return { editingId: uuid, ...gotoPageForRow(uuid, paginationState, visibleRows) };
      });
    },

    openNextForEditing: () => {
      set((state) => {
        if (state.editingAll || state.editingNone) {
          return state;
        }
        const { editableRows, visibleRows } = produceStateFromRows(rowsRef.current);
        const paginationState = producePaginationState(state.currentPage, pagination, visibleRows);
        if (state.editingId === undefined) {
          const firstRow = editableRows[0];
          return { editingId: firstRow.uuid, ...gotoPageForRow(firstRow.uuid, paginationState, visibleRows) };
        }
        const isLast = state.editingId === editableRows[editableRows.length - 1].uuid;
        if (isLast) {
          return { editingId: undefined };
        }
        const currentIndex = editableRows.findIndex((row) => row.uuid === state.editingId);
        const nextRow = editableRows[currentIndex + 1];
        return { editingId: nextRow.uuid, ...gotoPageForRow(nextRow.uuid, paginationState, visibleRows) };
      });
    },

    startAddingRow: (uuid) => {
      set((state) => {
        if (state.addingIds.includes(uuid)) {
          return state;
        }
        return { addingIds: [...state.addingIds, uuid], editingId: undefined };
      });
    },

    endAddingRow: (uuid) => {
      set((state) => {
        const i = state.addingIds.indexOf(uuid);
        if (i === -1) {
          return state;
        }
        return { addingIds: [...state.addingIds.slice(0, i), ...state.addingIds.slice(i + 1)] };
      });
    },

    startDeletingRow: (uuid) => {
      set((state) => {
        if (state.deletingIds.includes(uuid)) {
          return state;
        }
        return { deletingIds: [...state.deletingIds, uuid] };
      });
    },

    endDeletingRow: (uuid, successful) => {
      set((state) => {
        const isEditing = state.editingId === uuid;
        const i = state.deletingIds.indexOf(uuid);
        if (i === -1 && !isEditing) {
          return state;
        }
        const deletingIds = [...state.deletingIds.slice(0, i), ...state.deletingIds.slice(i + 1)];
        if (isEditing && successful) {
          return { editingId: undefined, deletingIds };
        }
        return {
          deletingIds,
          editingId: isEditing && successful ? undefined : state.editingId,
        };
      });
    },

    changePage: (page) => set((state) => ({ currentPage: page, ...(state.editingId && { editingId: undefined }) })),
  }));
}

function useExtendedRepeatingGroupState(node: LayoutNode<'RepeatingGroup'>): ExtendedContext {
  const state = ZStore.useSelector((state) => state);
  const stateRef = useAsRef(state);
  const pagination = useNodeItem(node, (i) => i.pagination);
  const validateOnSaveRow = useNodeItem(node, (i) => i.validateOnSaveRow);
  const groupBinding = useNodeItem(node, (i) => i.dataModelBindings.group);
  const rows = useNodeItem(node, (i) => i.rows);

  const appendToList = FD.useAppendToList();
  const removeFromList = FD.useRemoveFromListCallback();
  const onBeforeRowDeletion = useAttachmentDeletionInRepGroups(node);
  const onGroupCloseValidation = useOnGroupCloseValidation();

  const waitForItem = useWaitForNodeItem(node);

  const nodeState = produceStateFromRows(rows);
  const nodeStateRef = useAsRef(nodeState);
  const paginationState = producePaginationState(state.currentPage, pagination, nodeState.visibleRows);
  const paginationStateRef = useAsRef(paginationState);
  const [isFirstRender, setIsFirstRender] = useState(true);

  useLayoutEffect(() => {
    setIsFirstRender(false);
  }, []);

  const editingId = state.editingId;
  const editingIsHidden = editingId !== undefined && !nodeState.visibleRows.some((row) => row.uuid === editingId);
  useEffect(() => {
    if (editingId !== undefined && editingIsHidden) {
      stateRef.current.closeForEditing(editingId);
    }
  }, [editingId, editingIsHidden, stateRef]);

  // If rows are deleted so that the current pagination page no longer exists, go to the last page instead
  const { currentPage, totalPages, hasPagination } = paginationState;
  useEffect(() => {
    if (hasPagination && currentPage > totalPages - 1) {
      stateRef.current.changePage(totalPages - 1);
    }
  }, [currentPage, totalPages, stateRef, hasPagination]);

  const maybeValidateRow = useCallback(() => {
    const { editingAll, editingId, editingNone } = stateRef.current;
    if (!validateOnSaveRow || editingAll || editingNone || editingId === undefined) {
      return Promise.resolve(false);
    }
    return onGroupCloseValidation(node, editingId, validateOnSaveRow);
  }, [node, onGroupCloseValidation, stateRef, validateOnSaveRow]);

  const openForEditing = useCallback(
    async (uuid: string) => {
      if (await maybeValidateRow()) {
        return;
      }
      stateRef.current.openForEditing(uuid);
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
    async (uuid: string) => {
      if (await maybeValidateRow()) {
        return;
      }
      stateRef.current.closeForEditing(uuid);
    },
    [maybeValidateRow, stateRef],
  );

  const toggleEditing = useCallback(
    async (uuid: string) => {
      if (await maybeValidateRow()) {
        return;
      }
      const { editingId, closeForEditing, openForEditing } = stateRef.current;
      if (editingId === uuid) {
        closeForEditing(uuid);
      } else {
        openForEditing(uuid);
      }
    },
    [maybeValidateRow, stateRef],
  );

  const changePage = useCallback(
    async (page: number) => {
      if (await maybeValidateRow()) {
        return;
      }
      stateRef.current.changePage(page);
    },
    [maybeValidateRow, stateRef],
  );

  const changePageToRow = useCallback(
    async (uuid: string) => {
      if (await maybeValidateRow()) {
        return;
      }

      const page = getPageForRow(uuid, paginationStateRef.current, nodeStateRef.current.visibleRows);
      if (page == null) {
        return;
      }

      stateRef.current.changePage(page);
    },
    [maybeValidateRow, nodeStateRef, paginationStateRef, stateRef],
  );

  const isEditing = useCallback(
    (uuid: string) => {
      const { editingAll, editingId, editingNone } = stateRef.current;
      if (editingAll) {
        return true;
      }
      if (editingNone) {
        return false;
      }
      return editingId === uuid;
    },
    [stateRef],
  );

  const addRow = useCallback(async (): Promise<AddRowResult> => {
    const { startAddingRow, endAddingRow } = stateRef.current;
    if (!groupBinding) {
      return { result: 'stoppedByBinding', uuid: undefined, index: undefined };
    }
    if (await maybeValidateRow()) {
      return { result: 'stoppedByValidation', uuid: undefined, index: undefined };
    }
    const uuid = uuidv4();
    startAddingRow(uuid);
    appendToList({
      path: groupBinding,
      newValue: { [ALTINN_ROW_ID]: uuid },
    });
    let foundRow: RepGroupRow | undefined;
    await waitForItem((item) => {
      foundRow = item?.rows.find((row) => row.uuid === uuid);
      return !!foundRow;
    });
    endAddingRow(uuid);
    const index = foundRow?.index ?? -1;
    if (nodeStateRef.current.visibleRows.some((row) => row.uuid === uuid)) {
      await openForEditing(uuid);
      return { result: 'addedAndOpened', uuid, index };
    }

    return { result: 'addedAndHidden', uuid, index };
  }, [appendToList, groupBinding, maybeValidateRow, nodeStateRef, openForEditing, stateRef, waitForItem]);

  const deleteRow = useCallback(
    async (uuid: string) => {
      const { deletableRows } = nodeStateRef.current;
      const { startDeletingRow, endDeletingRow } = stateRef.current;
      const row = deletableRows.find((row) => row.uuid === uuid);
      if (!row) {
        return false;
      }

      startDeletingRow(uuid);
      const attachmentDeletionSuccessful = await onBeforeRowDeletion(uuid);
      if (attachmentDeletionSuccessful && groupBinding) {
        removeFromList({
          path: groupBinding,
          startAtIndex: row.index,
          callback: (item) => item[ALTINN_ROW_ID] === uuid,
        });

        endDeletingRow(uuid, true);
        return true;
      }

      endDeletingRow(uuid, false);
      return false;
    },
    [groupBinding, nodeStateRef, onBeforeRowDeletion, removeFromList, stateRef],
  );

  const isDeleting = useCallback((uuid: string) => stateRef.current.deletingIds.includes(uuid), [stateRef]);

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
    isFirstRender,
    changePage,
    changePageToRow,
    ...nodeState,
    ...paginationState,
  };
}

function ProvideTheRest({ node, children }: PropsWithChildren<Props>) {
  const extended = useExtendedRepeatingGroupState(node);
  return <ExtendedStore.Provider value={extended}>{children}</ExtendedStore.Provider>;
}

interface Props {
  node: LayoutNode<'RepeatingGroup'>;
}

export function RepeatingGroupProvider({ node, children }: PropsWithChildren<Props>) {
  const pagination = useNodeItem(node, (i) => i.pagination);
  const editMode = useNodeItem(node, (i) => i.edit?.mode);
  const rowsRef = useNodeItemRef(node, (i) => i.rows);
  return (
    <ZStore.Provider
      rowsRef={rowsRef}
      pagination={pagination}
      editMode={editMode}
    >
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
