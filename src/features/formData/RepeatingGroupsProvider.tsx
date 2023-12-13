import React from 'react';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { generateSimpleRepeatingGroups } from 'src/features/form/layout/repGroups/generateSimpleRepeatingGroups';
import type { ILayouts } from 'src/layout/layout';
import type { IRepeatingGroups } from 'src/types';

export interface RepeatingGroupsContext {
  repeatingGroups: IRepeatingGroups;
}

interface Props {
  initialFormData: object;
  layouts: ILayouts;
}

const { Provider, useSelector } = createZustandContext({
  name: 'RepeatingGroups',
  required: true,
  initialCreateStore: ({ initialFormData, layouts }: Props) =>
    createStore<RepeatingGroupsContext>()(
      immer((_set) => ({
        repeatingGroups: initRepeatingGroups(initialFormData, layouts),
      })),
    ),
});

function initRepeatingGroups(_initialFormData: object, layouts: ILayouts): IRepeatingGroups {
  return generateSimpleRepeatingGroups(layouts);
}

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

export const useRepeatingGroups = () => useSelector((state) => state.repeatingGroups);
export const useRepeatingGroup = (id: string) => useSelector((state) => state.repeatingGroups[id]);
