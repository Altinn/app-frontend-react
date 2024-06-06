import create from 'zustand';

interface TaskState {
  overriddenTaskId: string;
  overriddenDataModelId: string;
  overriddenLayoutSetId: string;
  setOverriddenLayoutSetId: (layoutSetId: string) => void;
  setOverriddenDataModelId: (taskId: string) => void;
  setTaskId: (taskId: string) => void;
  setDepth: (depth: number) => void;
  clearTaskId: () => void;
  depth: number;
}

export const useTaskStore = create<TaskState>((set) => ({
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
