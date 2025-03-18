import dot from 'dot-object';
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
  // You can store the resolved layouts if needed, or skip
  resolvedLayouts: ResolvedLayoutCollection;
  data: DataObject | undefined;

  /**
   * Map from a component ID to its component definition.
   * This is crucial for our "component" expression lookups.
   */
  componentMap?: Record<string, ResolvedCompExternal>;

  setLayoutSets: (schema: LayoutSetsSchema) => void;
  setProcess: (proc: ProcessSchema) => void;
  setPageOrder: (order: PageOrderDTO) => void;
  setLayouts: (layouts: ILayoutCollection) => void;
  setDataObject: (data: DataObject) => void;
  setDataValue: (key: string, value: string | boolean) => void;

  updateResolvedLayouts: () => void; // if you need it
  evaluateExpression: (expr: Expression) => any;
}

/**
 * Recursively walk all pages and components to create a map
 * { [componentId]: componentObject }.
 */
function buildComponentMap(collection: ResolvedLayoutCollection) {
  const map: Record<string, ResolvedCompExternal> = {};

  function recurse(components: ResolvedCompExternal[]) {
    for (const comp of components) {
      // Add the component to the map
      if (comp.id) {
        map[comp.id] = comp;
      }
      // If it has children, recurse
      if (comp.children && comp.children.length > 0) {
        for (const childGroup of comp.children) {
          // If `children` is an array-of-arrays for repeating groups,
          // handle that. Otherwise, just one array:
          if (Array.isArray(childGroup)) {
            recurse(childGroup);
          } else if (childGroup.children) {
            recurse(comp.children);
          }
        }
      }
    }
  }

  // For each page, walk its layout array
  for (const pageName of Object.keys(collection)) {
    recurse(collection[pageName].data.layout);
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
          // Build the map
          const compMap = buildComponentMap(resolvedLayoutCollection);

          // Store both the resolved layouts and the map
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

            const currentVal = dot.pick(dataKeyToUpdate, state.data);
            if (currentVal === newValue) {
              return {};
            }

            dot.set(dataKeyToUpdate, newValue, state.data);
            return { data: { ...state.data } };
          });
        },

        updateResolvedLayouts: () => {
          // If you do something else to rebuild resolvedLayouts, do it here
        },

        evaluateExpression: (expr: Expression) => {
          const { data, componentMap } = get();
          if (!data) {
            throw new Error('No data available in store');
          }
          // Evaluate the expression with data + componentMap
          return evaluateExpression(expr, data, componentMap);
        },
      }),
      {
        name: 'LayoutStore',
      },
    ),
  ),
);
//
// import dot from 'dot-object';
// import { createStore } from 'zustand';
// import { devtools, subscribeWithSelector } from 'zustand/middleware';
//
// import { evaluateExpression } from 'src/next/app/expressions/evaluateExpression';
// import { moveChildren } from 'src/next/app/utils/moveChildren';
// import type { Expression, ExprVal, ExprValToActualOrExpr } from 'src/features/expressions/types';
// import type { AllComponents, ILayoutCollection } from 'src/layout/layout';
// import type { LayoutSetsSchema } from 'src/next/types/LayoutSetsDTO';
// import type { PageOrderDTO } from 'src/next/types/PageOrderDTO';
// import type { ProcessSchema } from 'src/next/types/ProcessDTO';
// export interface DataObject {
//   [key: string]: string | null | object | DataObject | undefined;
// }
//
// export type ResolvedCompExternal = AllComponents & ExtraProps;
//
// interface ExtraProps {
//   isHidden: boolean;
//   renderedValue: string;
//   children: ResolvedCompExternal[] | undefined;
// }
//
// export interface ResolvedLayoutFile {
//   $schema?: string;
//   data: { layout: ResolvedCompExternal[]; hidden?: ExprValToActualOrExpr<ExprVal.Boolean>; expandedWidth?: boolean };
// }
//
// export type ResolvedLayoutCollection = { [pageName: string]: ResolvedLayoutFile };
//
// interface Layouts {
//   layoutSetsConfig: LayoutSetsSchema;
//   process: ProcessSchema;
//   pageOrder: PageOrderDTO;
//   layouts: ResolvedLayoutCollection;
//   resolvedLayouts: ResolvedLayoutCollection;
//   data: DataObject | undefined;
//   setLayoutSets: (schema: LayoutSetsSchema) => void;
//   setProcess: (proc: ProcessSchema) => void;
//   setPageOrder: (order: PageOrderDTO) => void;
//   setLayouts: (layouts: ILayoutCollection) => void;
//   setDataObject: (data: DataObject) => void;
//   setDataValue: (key: string, value: string | boolean) => void;
//   updateResolvedLayouts: () => void;
//   evaluateExpression: (expr: Expression) => any;
// }
//
// export const layoutStore = createStore<Layouts>()(
//   subscribeWithSelector(
//     devtools(
//       (set, get) => ({
//         data: undefined,
//         setLayoutSets: (schema) => set({ layoutSetsConfig: schema }),
//         setProcess: (proc) => set({ process: proc }),
//         setPageOrder: (order) => set({ pageOrder: order }),
//
//         setLayouts: (newLayouts) => {
//           if (!newLayouts) {
//             throw new Error('no layouts');
//           }
//           const resolvedLayoutCollection: ResolvedLayoutCollection = {};
//
//           Object.keys(newLayouts).forEach((key) => {
//             resolvedLayoutCollection[key] = {
//               ...newLayouts[key],
//               data: {
//                 ...newLayouts[key].data,
//                 layout: moveChildren(newLayouts[key]).data.layout,
//               },
//             };
//           });
//
//           set({ layouts: resolvedLayoutCollection });
//         },
//
//         setDataObject: (newData) => {
//           set({ data: newData });
//         },
//
//         setDataValue: (dataKeyToUpdate: string, newValue: string) => {
//           set((state) => {
//             if (!state.data) {
//               throw new Error('no data object');
//             }
//
//             const currentVal = dot.pick(dataKeyToUpdate, state.data);
//             if (currentVal === newValue) {
//               return {};
//             }
//
//             dot.set(dataKeyToUpdate, newValue, state.data);
//
//             return { data: { ...state.data } };
//           });
//         },
//         evaluateExpression: (expr: Expression) => {
//           const { data } = get();
//           if (!data) {
//             throw new Error('No data available in store');
//           }
//           return evaluateExpression(expr, data);
//         },
//       }),
//       {
//         name: 'LayoutStore',
//       },
//     ),
//   ),
// );
