import React from 'react';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import type { IRepeatingGroup, IRepeatingGroups } from 'src/types';

export interface RepeatingGroupsContext {
  repeatingGroups: IRepeatingGroups;
}

const { Provider, useSelector } = createZustandContext({
  name: 'RepeatingGroups',
  required: true,
  initialCreateStore: () =>
    createStore<RepeatingGroupsContext>()(
      immer((_set) => ({
        repeatingGroups: {},
      })),
    ),
});

const defaultState: IRepeatingGroup = {
  editIndex: -1,
  deletingIndex: [],
  multiPageIndex: -1,
};

export function RepeatingGroupsProvider({
  children,
  initialFormData,
}: PropsWithChildren<{
  initialFormData: object;
}>) {
  const layouts = useLayouts();
  return (
    <Provider
      layouts={layouts}
      initialFormData={initialFormData}
    >
      {children}
    </Provider>
  );
}

// TODO: Implement tools for adding rows, changing edit index, etc.
// We may not need this state at all, since we might be able to get away with keeping it inside the repeating group
// components themselves. Look into that when things start working again.

export const useRepeatingGroups = () => useSelector((state) => state.repeatingGroups);
export const useRepeatingGroup = (id: string): IRepeatingGroup => {
  const existingState = useSelector((state) => state.repeatingGroups[id]);
  return existingState ?? defaultState;
};
