import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { evaluateExpression } from 'src/next/app/expressions/evaluateExpression';
import { transformLayout } from 'src/next/app/utils/moveChildren';
import type { ILayoutFile } from 'src/layout/common.generated';
import type { ILayoutCollection } from 'src/layout/layout';
import type { LayoutSetsSchema } from 'src/next/types/LayoutSetsDTO';
import type { PageOrderDTO } from 'src/next/types/PageOrderDTO';
import type { ProcessSchema } from 'src/next/types/ProcessDTO';

interface DataObject {
  [key: string]: string | null | object | DataObject | undefined;
}

interface Layouts {
  layoutSetsConfig: LayoutSetsSchema;
  process: ProcessSchema;
  pageOrder: PageOrderDTO;
  layouts: ILayoutCollection;
  resolvedLayouts: ILayoutCollection;
  data: DataObject | undefined;
  setLayoutSets: (schema: LayoutSetsSchema) => void;
  setProcess: (proc: ProcessSchema) => void;
  setPageOrder: (order: PageOrderDTO) => void;
  setLayouts: (layouts: ILayoutCollection) => void;
  setDataObject: (data: DataObject) => void;
  setDataValue: (key: string, value: string) => void;
  updateResolvedLayouts: () => void;
}

/**
 * Transform the raw layout components into resolved ones by evaluating e.g. hidden expressions.
 */
function resolvePageLayoutComponents(components: ILayoutFile[], data: DataObject | undefined) {
  return components.map((component) => {
    // @ts-ignore
    const { hidden } = component;
    let resolvedHidden = false;

    if (Array.isArray(hidden)) {
      // @ts-ignore
      resolvedHidden = Boolean(evaluateExpression(hidden, data));
    } else if (typeof hidden === 'boolean') {
      resolvedHidden = hidden;
    }

    return {
      ...component,
      hidden: resolvedHidden,
    };
  });
}

/**
 * Rebuild all pages in `layouts` into a new `resolvedLayouts`.
 */
function rebuildResolvedLayouts(layouts: ILayoutCollection, data: DataObject | undefined): ILayoutCollection {
  const newResolved: ILayoutCollection = {};

  for (const pageId of Object.keys(layouts)) {
    const rawPage = layouts[pageId];
    // @ts-ignore
    const resolvedComponents = resolvePageLayoutComponents(rawPage.data.layout, data);

    newResolved[pageId] = {
      data: {
        ...rawPage.data,
        // @ts-ignore
        layout: resolvedComponents,
      },
    };
  }

  return newResolved;
}

export const layoutStore = createStore<Layouts>()(
  devtools(
    (set, get) => ({
      data: undefined,
      updateResolvedLayouts: () => {
        const { layouts, data } = get();
        if (!layouts) {
          return;
        }

        const newResolved = rebuildResolvedLayouts(layouts, data);

        set({ resolvedLayouts: newResolved });
      },

      setLayoutSets: (schema) => set({ layoutSetsConfig: schema }),
      setProcess: (proc) => set({ process: proc }),
      setPageOrder: (order) => set({ pageOrder: order }),
      setLayouts: (newLayouts) => {
        if (!newLayouts) {
          throw new Error('no layouts');
        }

        Object.values(newLayouts).map((currentLayout) => ({
          ...currentLayout,
          data: transformLayout(currentLayout),
        }));

        set({ layouts: newLayouts });
        get().updateResolvedLayouts();
      },

      // Setting data => also update resolved
      setDataObject: (newData) => {
        set({ data: newData });
        get().updateResolvedLayouts();
      },

      // Setting a single data key => also update resolved
      setDataValue: (dataKeyToUpdate: string, newValue: string) => {
        set((state) => ({
          data: {
            ...state.data,
            [dataKeyToUpdate]: newValue,
          },
        }));
        get().updateResolvedLayouts();
      },
    }),
    { name: 'LayoutStore' },
  ),
);
