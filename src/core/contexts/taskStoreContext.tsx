import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import type { QueryClient } from '@tanstack/react-query';

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

export const createTaskStore = () =>
  create<TaskState>((set) => ({
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

const StoreContext = createContext<ReturnType<typeof createTaskStore> | null>(null);

export function TaskStoreProvider({ children }: React.PropsWithChildren) {
  useInstantiationUrlReset();
  const storeRef = useRef<ReturnType<typeof createTaskStore>>(undefined);
  if (!storeRef.current) {
    storeRef.current = createTaskStore();
  }
  return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
}

export const useTaskStore = <T,>(selector: (state: TaskState) => T) => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useTaskStore must be used within a TaskStoreProvider');
  }
  return store(selector);
};

/**
 * When the URL changes (possibly because we redirected to the instance or because the user went
 * back to party selection after getting an error), we should clear the instantiation. We do this so that we're ready
 * for a possible next instantiation (when the user comes back to try instantiation again). This is needed
 * because the components that trigger instantiation might do so repeatedly - and we need to stop that.
 *
 * Some places instantiate as a direct result of a user action (clicking a button). Those will force
 * re-instantiation anyway and won't care if the previous instantiation was cleared before trying again.
 */
export function useInstantiationUrlReset() {
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Reset instantiation mutations when navigating away from instance pages
    // This prevents duplicate instantiation attempts
    if (!location.pathname.includes('/instance/')) {
      removeMutations(queryClient);
    }
  }, [location.pathname, queryClient]);
}

function removeMutations(queryClient: QueryClient) {
  const mutations = queryClient.getMutationCache().findAll({ mutationKey: ['instantiate'] });
  mutations.forEach((mutation) => queryClient.getMutationCache().remove(mutation));
}
