import React from 'react';

import { createStore } from 'zustand';

import { createZustandContext } from 'src/core/contexts/zustandContext';

interface TaskState {
  overriddenTaskId?: string;
  overriddenDataModelType?: string;
  overriddenDataModelUuid?: string;
  overriddenLayoutSetId?: string;
  depth?: number;
  setOverriddenLayoutSetId?: (layoutSetId: string) => void;
  setOverriddenDataModelType?: (dataModelType: string) => void;
  setOverriddenDataModelUuid?: (dataModelUuid: string) => void;
  setTaskId?: (taskId: string) => void;
  setDepth?: (depth: number) => void;
  clearTaskId?: () => void;
}

export const initialCreateStore = () =>
  createStore<TaskState>((set) => ({
    overriddenTaskId: undefined,
    overriddenDataModelType: undefined,
    overriddenDataModelUuid: undefined,
    overriddenLayoutSetId: undefined,
    depth: 1,
    setTaskId: (overriddenTaskId: string) => set({ overriddenTaskId }),
    setOverriddenLayoutSetId: (overriddenLayoutSetId: string) => set({ overriddenLayoutSetId }),
    setOverriddenDataModelType: (overriddenDataModelType: string) => set({ overriddenDataModelType }),
    setOverriddenDataModelUuid: (overriddenDataModelUuid: string) => set({ overriddenDataModelUuid }),
    clearTaskId: () => set({ overriddenTaskId: '' }),
    setDepth: (depth: number) => set({ depth }),
  }));

const { Provider, useSelector } = createZustandContext({
  name: 'TaskStore',
  required: true,
  initialCreateStore,
});

export function TaskStoreProvider({ children }: React.PropsWithChildren) {
  return <Provider>{children}</Provider>;
}

export const useTaskStore = <T,>(selector: (state: TaskState) => T) => useSelector(selector);
