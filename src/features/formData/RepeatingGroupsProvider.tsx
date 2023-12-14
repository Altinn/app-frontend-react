import React from 'react';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { groupIsRepeatingExt } from 'src/layout/Group/tools';
import { flattenObject } from 'src/utils/databindings';
import { getRepeatingGroups } from 'src/utils/formLayout';
import type { IFormData } from 'src/features/formData/index';
import type { CompGroupExternal } from 'src/layout/Group/config.generated';
import type { ILayouts } from 'src/layout/layout';
import type { IRepeatingGroup, IRepeatingGroups } from 'src/types';

export interface RepeatingGroupsContext {
  repeatingGroups: IRepeatingGroups;
  reInitialize: (formData: IFormData, layouts: ILayouts, changedFields: IFormData) => void;
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
        repeatingGroups: initRepeatingGroups(flattenObject(initialFormData), layouts),
        reInitialize: (formData, layouts, changedFields) => {
          _set((state) => {
            state.repeatingGroups = initRepeatingGroups(formData, layouts, state.repeatingGroups, changedFields);
          });
        },
      })),
    ),
});

/**
 * This function keeps most of the older initRepeatingGroupsSaga logic. We probably want to refactor this to be more
 * efficient, but for now we'll keep it as is.
 */
function initRepeatingGroups(
  formData: IFormData,
  layouts: ILayouts,
  prevGroups: IRepeatingGroups = {},
  changedFields: IFormData = {},
): IRepeatingGroups {
  const nextGroups = {};
  for (const layoutPage of Object.keys(layouts)) {
    const page = layouts[layoutPage];
    if (page) {
      nextGroups[layoutPage] = getRepeatingGroups(page, formData);
    }
  }

  // TODO: At this point the saga removes validations. We probably won't need that with the new validation system,
  // but we should double check.
  const prevGroupKeys = Object.keys(prevGroups);

  const newGroupKeys = Object.keys(nextGroups);
  const groupContainers = Object.values(layouts)
    .flatMap((e) => e)
    .filter((e) => e && e.type === 'Group') as CompGroupExternal[];

  newGroupKeys.forEach((key) => {
    const group = nextGroups[key];
    const container = groupContainers.find((element) => element.id === key);
    if (container && group.index >= 0 && groupIsRepeatingExt(container)) {
      if (container.edit?.openByDefault === 'first') {
        group.editIndex = 0;
      } else if (container.edit?.openByDefault === 'last') {
        group.editIndex = group.index;
      }
    }
  });

  // preserve current edit and multipage index if still valid
  prevGroupKeys
    .filter((key) => nextGroups[key] !== undefined)
    .forEach((key) => {
      const prevGroup = prevGroups[key];
      const nextGroup = nextGroups[key];

      // We add +1 to the index because it's entirely valid (and common) to be editing the last row in a group (bacause
      // that's what happens when you click the 'add' button). If we didn't add +1 here, the user could be editing the
      // last row in a group, and a server-sent change could cause the editing mode to disappear.
      if (
        prevGroup.editIndex !== undefined &&
        prevGroup.editIndex != -1 &&
        nextGroup.index + 1 >= prevGroup.editIndex
      ) {
        nextGroup.editIndex = prevGroup.editIndex;
      }

      if (prevGroup.multiPageIndex !== undefined) {
        nextGroup.multiPageIndex = prevGroup.multiPageIndex;
      }

      const dmBinding = nextGroup.dataModelBinding;
      const changesInThisGroup = dmBinding && Object.keys(changedFields).some((key) => key.startsWith(dmBinding));

      if (prevGroup.index > nextGroup.index && !changesInThisGroup) {
        // A user might have clicked the 'add' button multiple times without having started to fill out every new row
        // yet. We need to preserve the index of the last row that was added so that the user can continue to fill out
        // the form from where they left off. If, however, the server changed something in our group, they might
        // also have deleted rows. In that case we need to reset the index to the last row.
        nextGroup.index = prevGroup.index;
      }
    });

  return nextGroups;
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
export const useRepeatingGroup = (id: string): IRepeatingGroup | undefined =>
  useSelector((state) => state.repeatingGroups[id]);
