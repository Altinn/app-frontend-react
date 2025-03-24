import dot from 'dot-object';
import { produce } from 'immer';
import { createStore } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { evaluateExpression } from 'src/next/app/expressions/evaluateExpression';
import { moveChildren } from 'src/next/app/utils/moveChildren';
import type { Expression, ExprVal, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { AllComponents, ILayoutCollection } from 'src/layout/layout';
import type { LayoutSetsSchema } from 'src/next/types/LayoutSetsDTO';
import type { PageOrderDTO } from 'src/next/types/PageOrderDTO';
import type { ProcessSchema } from 'src/next/types/ProcessDTO';

export interface DataObject {
  [key: string]: string | null | object | DataObject | undefined;
}

export type ResolvedCompExternal = AllComponents & ExtraProps;

interface ExtraProps {
  isHidden: boolean;
  renderedValue: string;
  children: ResolvedCompExternal[] | undefined;
}

export interface ResolvedLayoutFile {
  $schema?: string;
  data: { layout: ResolvedCompExternal[]; hidden?: ExprValToActualOrExpr<ExprVal.Boolean>; expandedWidth?: boolean };
}

export type ResolvedLayoutCollection = { [pageName: string]: ResolvedLayoutFile };

interface Layouts {
  layoutSetsConfig: LayoutSetsSchema;
  process: ProcessSchema;
  pageOrder: PageOrderDTO;
  layouts: ResolvedLayoutCollection;
  resolvedLayouts: ResolvedLayoutCollection;
  data: DataObject | undefined;

  componentMap?: Record<string, ResolvedCompExternal>;

  setLayoutSets: (schema: LayoutSetsSchema) => void;
  setProcess: (proc: ProcessSchema) => void;
  setPageOrder: (order: PageOrderDTO) => void;
  setLayouts: (layouts: ILayoutCollection) => void;
  setDataObject: (data: DataObject) => void;
  setDataValue: (key: string, value: string | boolean) => void;

  updateResolvedLayouts: () => void; // if you need it
  evaluateExpression: (expr: Expression, parentBinding?: string, itemIndex?: number) => any;
}

function buildComponentMap(collection: ResolvedLayoutCollection) {
  const map: Record<string, ResolvedCompExternal> = {};

  function traverse(components: ResolvedCompExternal[] | undefined) {
    if (!Array.isArray(components)) {
      return;
    }

    for (const comp of components) {
      if (comp.id) {
        map[comp.id] = comp;
      }

      if (Array.isArray(comp.children)) {
        traverse(comp.children as ResolvedCompExternal[]);
      }
    }
  }

  // For each page in the layout, traverse its layout array
  for (const pageId of Object.keys(collection)) {
    const layout = collection[pageId]?.data?.layout;
    traverse(layout);
  }

  return map;
}

export const layoutStore = createStore<Layouts>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        data: undefined,
        setLayoutSets: (schema) => set({ layoutSetsConfig: schema }),
        setProcess: (proc) => set({ process: proc }),
        setPageOrder: (order) => set({ pageOrder: order }),

        setLayouts: (newLayouts) => {
          if (!newLayouts) {
            throw new Error('no layouts');
          }
          const resolvedLayoutCollection: ResolvedLayoutCollection = {};

          Object.keys(newLayouts).forEach((key) => {
            resolvedLayoutCollection[key] = {
              ...newLayouts[key],
              data: {
                ...newLayouts[key].data,
                layout: moveChildren(newLayouts[key]).data.layout,
              },
            };
          });
          const compMap = buildComponentMap(resolvedLayoutCollection);

          set({
            layouts: resolvedLayoutCollection,
            componentMap: compMap,
          });
        },

        setDataObject: (newData) => {
          set({ data: newData });
        },

        setDataValue: (dataKeyToUpdate: string, newValue: string | boolean) => {
          set((state) => {
            if (!state.data) {
              throw new Error('no data object');
            }
            return produce(state, (draft) => {
              const currentVal = dot.pick(dataKeyToUpdate, draft.data);
              if (!draft.data) {
                throw new Error('no draft data');
              }
              if (currentVal !== newValue) {
                dot.set(dataKeyToUpdate, newValue, draft.data);
              }
            });
          });
        },

        evaluateExpression: (expr: Expression, parentBinding?: string, itemIndex?: number) => {
          const { data, componentMap } = get();
          if (!data) {
            throw new Error('No data available in store');
          }

          // Evaluate the expression with data + componentMap
          return evaluateExpression(expr, data, componentMap, parentBinding, itemIndex);
        },
      }),
      {
        name: 'LayoutStore',
      },
    ),
  ),
);
