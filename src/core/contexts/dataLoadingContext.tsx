import React, { createContext, useContext } from 'react';

import { create } from 'zustand';

export interface DataLoading {
  dataElements: Record<string, boolean>;
  isDone: () => boolean;
  setDataElements: (dataElements: Record<string, boolean>) => void;
}

export const createDataLoadingStore = () =>
  create<DataLoading>((set, state) => ({
    dataElements: {},
    isDone() {
      return Object.values(state().dataElements).every((v) => v === true);
    },
    setDataElements: (newDataElements: Record<string, boolean>) => {
      set((state) => ({
        dataElements: {
          ...state.dataElements,
          ...newDataElements,
        },
      }));
    },
  }));

const StoreContext = createContext<ReturnType<typeof createDataLoadingStore> | null>(null);

export function DataLoadingProvider({ children }: React.PropsWithChildren) {
  const store = createDataLoadingStore();

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export const useDataLoadingStore = <T,>(selector: (state: DataLoading) => T) => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useDataLoadingStore must be used within a DataLoadingProvider');
  }

  return store(selector);
};
