import { devtools, subscribeWithSelector } from 'zustand/middleware';
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
    devtools(
      subscribeWithSelector((set, get) => ({
        data: undefined,

        getData: () => get().data,

        setData: (data) => set({ data }, false, 'setData'),

        updateData: (updater) =>
          set(
            (state) => ({
              data: state.data ? updater(state.data) : undefined,
            }),
            false,
            'updateData',
          ),

        clearData: () => set({ data: undefined }, false, 'clearData'),
      })),
      { name: 'FormEngine-DataStore' },
    ),
  );

export const dataStore = createDataStore();
