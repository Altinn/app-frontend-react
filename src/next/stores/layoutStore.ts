import dot from 'dot-object';
import { produce } from 'immer';
import { createStore } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { evaluateExpression } from 'src/next/app/expressions/evaluateExpression';
import { isFormComponentProps } from 'src/next/app/hooks/useValidateComponent';
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
  setBoundValue: (
    component: ResolvedCompExternal,
    newValue: any,
    parentBinding?: string,
    itemIndex?: number,
    childField?: string,
  ) => void;
  updateResolvedLayouts: () => void; // if you need it
  evaluateExpression: (expr: Expression, parentBinding?: string, itemIndex?: number) => any;
  validateComponent: (
    component: ResolvedCompExternal,
    parentBinding?: string,
    itemIndex?: number,
    childField?: string,
  ) => string[];
  getBoundValue: (
    component: ResolvedCompExternal,
    parentBinding?: string,
    itemIndex?: number,
    childField?: string,
  ) => any;
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

        evaluateExpression: (expr: Expression, parentBinding?: string, itemIndex?: number) => {
          const { data, componentMap } = get();
          if (!data) {
            throw new Error('No data available in store');
          }

          return evaluateExpression(expr, data, componentMap, parentBinding, itemIndex);
        },

        validateComponent: (
          component: ResolvedCompExternal,
          parentBinding?: string,
          itemIndex?: number,
          childField?: string,
        ) => {
          if (!isFormComponentProps(component)) {
            return [];
          }
          const errors: string[] = [];

          const currentValue = get().getBoundValue(component, parentBinding, itemIndex, childField);

          let isRequired: boolean;

          if (!Array.isArray(component.required)) {
            isRequired = !!component.required;
          }

          const { evaluateExpression } = get();

          // @ts-ignore
          isRequired = evaluateExpression(component.required, parentBinding, itemIndex);

          if (isRequired) {
            if (!currentValue) {
              errors.push('This value is required');
            }
          }
          return errors;
        },

        getBoundValue: (component, parentBinding, itemIndex, childField) => {
          const data = get().data;
          if (!data) {
            return undefined;
          }

          // @ts-ignore
          const simple = component.dataModelBindings?.simpleBinding;
          if (!simple) {
            return undefined;
          }
          const binding = parentBinding ? `${parentBinding}[${itemIndex}]${childField || ''}` : simple;

          return dot.pick(binding, data);
        },
        setBoundValue: (component, newValue, parentBinding, itemIndex, childField) => {
          // @ts-ignore
          const simple = component.dataModelBindings?.simpleBinding;
          if (!simple) {
            return; // or throw
          }

          const binding = parentBinding ? `${parentBinding}[${itemIndex}]${childField || ''}` : simple;

          set((state) => {
            if (!state.data) {
              throw new Error('No data object');
            }
            return produce(state, (draft) => {
              const currentVal = dot.pick(binding, draft.data);
              if (!draft.data) {
                throw new Error('no draft data');
              }
              if (currentVal !== newValue) {
                dot.set(binding, newValue, draft.data);
              }
            });
          });
        },
      }),
      {
        name: 'LayoutStore',
      },
    ),
  ),
);
