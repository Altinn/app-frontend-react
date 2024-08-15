import React, { createContext, useContext } from 'react';

import { create } from 'zustand';

import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface TaskState {
  overriddenTaskId?: string;
  overriddenDataModelType?: string;
  overriddenDataModelUuid?: string;
  overriddenLayoutSetId?: string;
  setOverriddenLayoutSetId?: (layoutSetId: string) => void;
  setOverriddenDataModelType?: (dataModelId: string) => void;
  setOverriddenDataModelUuid?: (dataModelUuid: string) => void;
  setTaskId?: (taskId: string) => void;
  setDepth?: (depth: number) => void;
  clearTaskId?: () => void;
  depth?: number;
  summaryNode: LayoutNode<'Summary2'>;
}

export const createSummaryStore = (summaryNode: LayoutNode<'Summary2'>) =>
  create<TaskState>((set) => ({
    overriddenTaskId: '',
    overriddenDataModelType: '',
    overriddenDataModelUuid: '',
    overriddenLayoutSetId: '',
    depth: 1,
    setTaskId: (overriddenTaskId: string) => set({ overriddenTaskId }),
    setOverriddenLayoutSetId: (overriddenLayoutSetId: string) => set({ overriddenLayoutSetId }),
    setOverriddenDataModelType: (overriddenDataModelType: string) => set({ overriddenDataModelType }),
    setOverriddenDataModelUuid: (overriddenDataModelUuid: string) => set({ overriddenDataModelUuid }),
    clearTaskId: () => set({ overriddenTaskId: '' }),
    setDepth: (depth: number) => set({ depth }),
    summaryNode,
  }));

const StoreContext = createContext<ReturnType<typeof createSummaryStore> | null>(null);

interface Summary2StoreProviderProps extends React.PropsWithChildren {
  summaryNode: LayoutNode<'Summary2'>;
}

export function Summary2StoreProvider({ children, summaryNode }: Summary2StoreProviderProps) {
  const store = createSummaryStore(summaryNode);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export const useTaskStore = <T,>(selector: (state: TaskState) => T): T => {
  const store = useContext(StoreContext);
  if (!store) {
    return {} as T;
  }
  return store(selector);
};
