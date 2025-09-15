import { subscribeWithSelector } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

export interface DataObject {
  [key: string]: string | number | boolean | null | object | DataObject | undefined;
}

export interface DataStore {
  data: DataObject | undefined;
  getData: () => DataObject | undefined;
  setData: (data: DataObject) => void;
  updateData: (updater: (data: DataObject) => DataObject) => void;
  clearData: () => void;
}

export const createDataStore = () =>
  createStore<DataStore>()(
    subscribeWithSelector((set, get) => ({
      data: undefined,

      getData: () => get().data,

      setData: (data) => set({ data }),

      updateData: (updater) =>
        set((state) => ({
          data: state.data ? updater(state.data) : undefined,
        })),

      clearData: () => set({ data: undefined }),
    })),
  );

export const dataStore = createDataStore();
