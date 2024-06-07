import React, { createContext, useContext } from 'react';

import { create } from 'zustand';

interface TaskState {
  overriddenTaskId?: string;
  overriddenDataModelId?: string;
  overriddenLayoutSetId?: string;
  setOverriddenLayoutSetId?: (layoutSetId: string) => void;
  setOverriddenDataModelId?: (taskId: string) => void;
  setTaskId?: (taskId: string) => void;
  setDepth?: (depth: number) => void;
  clearTaskId?: () => void;
  depth?: number;
}

// export const useTaskStore = create<TaskState>((set) => ({
//   overriddenTaskId: '',
//   overriddenDataModelId: '',
//   overriddenLayoutSetId: '',
//   depth: 1,
//   setTaskId: (overriddenTaskId: string) => set({ overriddenTaskId }),
//   setOverriddenLayoutSetId: (overriddenLayoutSetId: string) => set({ overriddenLayoutSetId }),
//   setOverriddenDataModelId: (overriddenDataModelId: string) => set({ overriddenDataModelId }),
//   clearTaskId: () => set({ overriddenTaskId: '' }),
//   setDepth: (depth: number) => set({ depth }),
// }));

export const createTaskIdStore = () =>
  create<TaskState>((set) => ({
    overriddenTaskId: '',
    overriddenDataModelId: '',
    overriddenLayoutSetId: '',
    depth: 1,
    setTaskId: (overriddenTaskId: string) => set({ overriddenTaskId }),
    setOverriddenLayoutSetId: (overriddenLayoutSetId: string) => set({ overriddenLayoutSetId }),
    setOverriddenDataModelId: (overriddenDataModelId: string) => set({ overriddenDataModelId }),
    clearTaskId: () => set({ overriddenTaskId: '' }),
    setDepth: (depth: number) => set({ depth }),
  }));

const StoreContext = createContext<ReturnType<typeof createTaskIdStore> | null>(null);

export function TaskIdStoreProvider({ children }: React.PropsWithChildren) {
  const store = createTaskIdStore();

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export const useTaskStore = <T,>(selector: (state: TaskState) => T): T => {
  const store = useContext(StoreContext);
  if (!store) {
    return {} as T;
    //  throw new Error('useStore must be used within a StoreProvider');
  }
  return store(selector);
};
