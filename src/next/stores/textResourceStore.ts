import { createStore } from 'zustand/index';
import { devtools } from 'zustand/middleware';

import type { TextResource } from 'src/next/app/api';

interface TextResourceStore {
  setTextResource: (textResource: TextResource) => void;
  textResource?: TextResource;
}

export const textResourceStore = createStore<TextResourceStore>()(
  devtools(
    (set, get) => ({
      textResource: undefined,
      setTextResource: (textResource: TextResource) => {
        set(() => ({
          textResource,
        }));
      },
    }),
    { name: 'TextResourceStore' }, // Name to display in Redux DevTools
  ),
);
