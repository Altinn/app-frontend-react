import { createStore } from 'zustand/index';

import type { Instance } from 'src/next-prev/app/api';
interface InstanceStore {
  instance?: Instance;
  setInstance: (instance: Instance) => void;
}
export const instanceStore = createStore<InstanceStore>((set, getState) => ({
  instance: undefined,
  setInstance: (instance: Instance) => {
    set({
      ...getState(),
      instance,
    });
  },
}));
