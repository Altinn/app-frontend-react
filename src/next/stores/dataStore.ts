import { createStore } from 'zustand/index';

interface DataObject {
  [dataType: string]: string | null | object;
}

interface DataStore {
  data: DataObject | undefined;
  setDataObject: (data: DataObject) => void;
  setDataValue: (key: string, value: string) => void;
}

export const dataStore = createStore<DataStore>((set, getState) => ({
  data: undefined,
  setDataObject: (data) => set({ data }),
  setDataValue: (dataKeyToUpdate: string, newValue: string) => {
    set((state) => ({
      data: {
        ...state.data,
        [dataKeyToUpdate]: newValue,
      },
    }));
    // set the value of DataStore.data[dataKeyToUpdate] to newValue
  },
}));
