import React, { createContext, useContext } from 'react';

import { create } from 'zustand';

export interface TaskState {
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
}

export const createTaskStore = <T extends TaskState>(initialState?: Partial<T>) =>
  create<T>((set) => ({
    overriddenTaskId: '',
    overriddenDataModelType: '',
    overriddenDataModelUuid: '',
    overriddenLayoutSetId: '',
    depth: 1,
    ...(initialState as T),
    setTaskId: (overriddenTaskId: string) => set((state) => ({ ...state, overriddenTaskId })),
    setOverriddenLayoutSetId: (overriddenLayoutSetId: string) => set((state) => ({ ...state, overriddenLayoutSetId })),
    setOverriddenDataModelType: (overriddenDataModelType: string) =>
      set((state) => ({ ...state, overriddenDataModelType })),
    setOverriddenDataModelUuid: (overriddenDataModelUuid: string) =>
      set((state) => ({ ...state, overriddenDataModelUuid })),
    clearTaskId: () => set((state) => ({ ...state, overriddenTaskId: '' })),
    setDepth: (depth: number) => set((state) => ({ ...state, depth })),
  }));

const TaskStoreContext = createContext<ReturnType<typeof createTaskStore<TaskState>> | null>(null);

export function TaskStoreProvider({ children }: React.PropsWithChildren) {
  const store = createTaskStore<TaskState>();

  return <TaskStoreContext.Provider value={store}>{children}</TaskStoreContext.Provider>;
}

export const useTaskStore = <T,>(selector: (state: TaskState) => T): T => {
  const store = useContext(TaskStoreContext);
  if (!store) {
    return {} as T;
  }
  return store(selector);
};
