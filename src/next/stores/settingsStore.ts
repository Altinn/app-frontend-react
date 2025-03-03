import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { isInitialState } from 'src/next/types/InitialState/initialStateTypeChecker';
import type { InitialState } from 'src/next/types/InitialState/InitialState';

const getInitialState = (): InitialState => {
  const windowValid =
    typeof window !== 'undefined' && (window as unknown as { __INITIAL_STATE__: unknown }).__INITIAL_STATE__;

  if (!windowValid) {
    throw new Error('window invalid');
  }

  const state = (window as unknown as { __INITIAL_STATE__: unknown }).__INITIAL_STATE__;

  if (!isInitialState(state)) {
    throw new Error('State is invalid');
  }

  return state;
};

// Create the Zustand store with devtools
export const initialStateStore = createStore<InitialState>()(
  devtools(
    (set) => ({
      ...getInitialState(),
      setApplicationMetadata: (metadata) => set({ applicationMetadata: metadata }),
      setUser: (user) => set({ user }),
      setValidParties: (parties) => set({ validParties: parties }),
    }),
    { name: 'InitialStateStore' },
  ),
);
