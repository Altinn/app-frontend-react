import dot from 'dot-object';
import { createSelector } from 'reselect';
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
  setLayoutSets: (schema: LayoutSetsSchema) => void;
  setProcess: (proc: ProcessSchema) => void;
  setPageOrder: (order: PageOrderDTO) => void;
  setLayouts: (layouts: ILayoutCollection) => void;
  setDataObject: (data: DataObject) => void;
  setDataValue: (key: string, value: string | boolean) => void;
  updateResolvedLayouts: () => void;
  evaluateExpression: (expr: Expression) => any;
}

/**
 * Transform the raw layout components into resolved ones by evaluating e.g. hidden expressions.
 */
function resolvePageLayoutComponents(
  components: ResolvedCompExternal[],
  data: DataObject | undefined,
): ResolvedCompExternal[] {
  // @ts-ignore
  return components.map((component) => {
    let resolvedHidden = false;

    if (Array.isArray(component.hidden)) {
      resolvedHidden = Boolean(evaluateExpression(component.hidden, data));
    } else if (typeof component.hidden === 'boolean') {
      resolvedHidden = component.hidden;
    }

    let renderedValue: string | object | null | undefined = '';

    if (component.dataModelBindings && data && component.dataModelBindings['simpleBinding']) {
      const val = dot.pick(component.dataModelBindings['simpleBinding'], data);
      renderedValue = val;
    }

    let resolvedChildren: ResolvedCompExternal[] = [];

    if (component.children) {
      // @ts-ignore
      const dataModelBinding = component.dataModelBindings['group'];
      const dataForKids = dot.pick(dataModelBinding, data);
      const mappedKids = dataForKids?.map((currentData) =>
        resolvePageLayoutComponents(component.children as ResolvedCompExternal[], currentData),
      );

      resolvedChildren = mappedKids;
    }

    return {
      ...component,
      isHidden: resolvedHidden,
      renderedValue,
      children: resolvedChildren, //component.children ? resolvePageLayoutComponents(component.children, data) : [],
    };
  });
}

/**
 * Rebuild all pages in `layouts` into a new `resolvedLayouts`.
 */
function rebuildResolvedLayouts(
  layouts: ResolvedLayoutCollection,
  data: DataObject | undefined,
): ResolvedLayoutCollection {
  const newResolved: ResolvedLayoutCollection = {};

  for (const pageId of Object.keys(layouts)) {
    const rawPage = layouts[pageId];

    const resolvedComponents = resolvePageLayoutComponents(rawPage.data.layout, data);

    newResolved[pageId] = {
      data: {
        ...rawPage.data,
        layout: resolvedComponents,
      },
    };
  }

  return newResolved;
}

const selectResolvedLayouts = createSelector(
  [(state: Layouts) => state.layouts, (state: Layouts) => state.data],
  (layouts, data) => {
    if (!layouts) {
      return {};
    }
    return rebuildResolvedLayouts(layouts, data);
  },
);

export const layoutStore = createStore<Layouts>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        data: undefined,

        // updateResolvedLayouts: () => {
        //   // Use our memoized selector:
        //   const newResolved = selectResolvedLayouts(get());
        //   set({ resolvedLayouts: newResolved });
        // },

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

          set({ layouts: resolvedLayoutCollection });
          //get().updateResolvedLayouts();
        },

        setDataObject: (newData) => {
          set({ data: newData });
          //get().updateResolvedLayouts();
        },

        setDataValue: (dataKeyToUpdate: string, newValue: string) => {
          set((state) => {
            if (!state.data) {
              throw new Error('no data object');
            }

            const currentVal = dot.pick(dataKeyToUpdate, state.data);
            if (currentVal === newValue) {
              return {};
            }

            dot.set(dataKeyToUpdate, newValue, state.data);

            return { data: { ...state.data } };
          });
        },
        evaluateExpression: (expr: Expression) => {
          const { data } = get();
          if (!data) {
            throw new Error('No data available in store');
          }
          return evaluateExpression(expr, data);
        },
      }),
      {
        name: 'LayoutStore',
      },
    ),
  ),
);
