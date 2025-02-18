import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { evaluateExpression } from 'src/next/app/expressions/evaluateExpression';
import { transformLayout } from 'src/next/app/utils/moveChildren';
import type { ILayoutFile } from 'src/layout/common.generated';
import type { ILayoutCollection } from 'src/layout/layout';
import type { LayoutSetsSchema } from 'src/next/types/LayoutSetsDTO';
import type { PageOrderDTO } from 'src/next/types/PageOrderDTO';
import type { ProcessSchema } from 'src/next/types/ProcessDTO';

/**
 * A shape for data in your store.
 * Extend as needed (objects, nested structures, etc.).
 */
interface DataObject {
  [key: string]: string | null | object | DataObject | undefined;
}

// interface ResolvedLayout {
//   value: string;
//   hidden: boolean;
// }
//
// export type ResolvedLayoutCollection = { [pageName: string]: ResolvedLayout };

interface Layouts {
  layoutSetsConfig: LayoutSetsSchema;
  process: ProcessSchema;
  pageOrder: PageOrderDTO;

  /** The raw layouts from your files. */
  layouts: ILayoutCollection;

  /** The resolved layouts that have hidden expressions evaluated. */
  resolvedLayouts: ILayoutCollection;

  /** Data used for expression evaluation. */
  data: DataObject | undefined;

  // Setters
  setLayoutSets: (schema: LayoutSetsSchema) => void;
  setProcess: (proc: ProcessSchema) => void;
  setPageOrder: (order: PageOrderDTO) => void;
  setLayouts: (layouts: ILayoutCollection) => void;
  setDataObject: (data: DataObject) => void;
  setDataValue: (key: string, value: string) => void;

  // Internal method to rebuild resolvedLayouts whenever data/layouts changes
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
    // If hidden is something else, default to false or handle as needed

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
    // Re-map the layout array:
    // @ts-ignore
    const resolvedComponents = resolvePageLayoutComponents(rawPage.data.layout, data);

    // Copy the rest of the structure, but replace `data.layout` with resolved
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
      // Initial data

      // The raw layouts

      // Resolved layouts
      //resolvedLayouts: exampleLayoutCollection, // start out same as raw or empty if you prefer

      data: undefined,

      // Recompute resolvedLayouts
      updateResolvedLayouts: () => {
        const { layouts, data } = get();
        if (!layouts) {
          return;
        }

        const newResolved = rebuildResolvedLayouts(layouts, data);

        // console.log('newResolved');
        // console.log(JSON.stringify(newResolved['InputPage'], null, 2));

        set({ resolvedLayouts: newResolved });
      },

      // Setters
      setLayoutSets: (schema) => set({ layoutSetsConfig: schema }),
      setProcess: (proc) => set({ process: proc }),
      setPageOrder: (order) => set({ pageOrder: order }),

      // Setting layouts => also update resolved
      setLayouts: (newLayouts) => {
        if (!newLayouts) {
          throw new Error('no layouts');
        }

        const transformedLayouts = Object.values(newLayouts).map((currentLayout) => ({
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
