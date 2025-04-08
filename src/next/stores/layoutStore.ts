import dot from 'dot-object';
import { produce } from 'immer';
import { createStore } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { JSONSchema7 } from 'json-schema';

import { API_CLIENT } from 'src/next/app/App/App';
import { evaluateExpression } from 'src/next/app/expressions/evaluateExpression';
import { isFormComponentProps } from 'src/next/app/hooks/useValidateComponent';
import { getSchemaProperty } from 'src/next/app/utils/getSchemaProperty';
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
  //  isHidden: boolean;
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
  dataModelSchemas?: Record<string, JSONSchema7>;
  componentMap?: Record<string, ResolvedCompExternal>;
  options?: Record<string, any>;
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
  setDataModelSchema: (dataModelName: string, dataModelSchema: JSONSchema7) => void;
  addRow: (dataModelBinding) => void;
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

function getDistinctOptionsIds(data: Record<string, any>): string[] {
  const results = new Set<string>();
  for (const key in data) {
    if (data[key]?.optionsId) {
      results.add(data[key].optionsId);
    }
  }
  return Array.from(results);
}

export const layoutStore = createStore<Layouts>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        data: undefined,
        setLayoutSets: (schema) => set({ layoutSetsConfig: schema }),
        setProcess: (proc) => set({ process: proc }),
        setPageOrder: (order) => set({ pageOrder: order }),

        setLayouts: async (newLayouts) => {
          if (!newLayouts) {
            throw new Error('no layouts');
          }

          // 1) Wrap and restructure your incoming layouts, same as before
          const resolvedLayoutCollection: any = {};
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

          const distinctOptionIds = getDistinctOptionsIds(compMap);

          const fetchPromises = distinctOptionIds.map(async (id) => {
            // Adjust org/app to whatever you have in your context
            const org = 'krt';
            const app = 'krt-3010a-1';

            // Possibly also pass language/queryParams:
            const response = await API_CLIENT.org.optionsDetail(
              id,
              org,
              app,
              { language: 'nb' }, // example
            );
            const data = await response.json();
            set((state) =>
              produce(state, (draft) => {
                if (!draft.options) {
                  draft.options = {};
                }
                draft.options[id] = data;
              }),
            );
          });

          if (fetchPromises.length > 0) {
            await Promise.all(fetchPromises);
          }

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
            return;
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

        setDataModelSchema: (dataModelName: string, dataModelSchema: JSONSchema7) => {
          set((state) =>
            produce(state, (draft) => {
              if (!draft.dataModelSchemas) {
                draft.dataModelSchemas = {};
              }
              draft.dataModelSchemas[dataModelName] = dataModelSchema;
            }),
          );
        },

        // addRow: (dataModelBinding: string, parentBinding?: string, itemIndex?: number, childField?: string) => {
        //   set((state) =>
        //     produce(state, (draft) => {
        //       if (!draft.dataModelSchemas) {
        //         throw new Error('Tried to add a row without a data model schema loaded.');
        //       }
        //
        //       // // 1) Get the "simple" binding from the component
        //       // // @ts-ignore
        //       // const simple = component.dataModelBindings?.simpleBinding;
        //       // if (!simple) {
        //       //   throw new Error('No simpleBinding found in component.dataModelBindings');
        //       // }
        //
        //       // 2) Build the final dot-path (same as setBoundValue)
        //       const binding = parentBinding ? `${parentBinding}[${itemIndex}]${childField || ''}` : dataModelBinding;
        //
        //       // 3) Look up the sub-schema for that binding
        //       const schema = draft.dataModelSchemas['model'];
        //       const property = getSchemaProperty(schema, binding);
        //       if (!property?.properties) {
        //         throw new Error(`Could not find a definition with 'properties' for '${binding}' in schema.`);
        //       }
        //
        //       // 4) Ensure the data at 'binding' is an array
        //       let currentValue = dot.pick(binding, draft.data);
        //       if (!Array.isArray(currentValue)) {
        //         currentValue = [];
        //         dot.set(binding, currentValue, draft.data);
        //       }
        //
        //       // 5) Create a new row object with each key = null
        //       const newRow: Record<string, any> = {};
        //       for (const key of Object.keys(property.properties)) {
        //         newRow[key] = null;
        //       }
        //
        //       // 6) Push the new row to the array
        //       currentValue.push(newRow);
        //     }),
        //   );
        // },

        addRow: (dataModelBinding: string) => {
          set((state) =>
            produce(state, (draft) => {
              if (!draft.dataModelSchemas) {
                throw new Error('Tried to add a row without a data model schema loaded.');
              }

              // 1) Retrieve the schema, then lookup the property using getSchemaProperty
              const schema = draft.dataModelSchemas['model'];
              const property = getSchemaProperty(schema, dataModelBinding);
              if (!property?.properties) {
                throw new Error(`Could not find a definition with properties for '${dataModelBinding}' in schema.`);
              }

              // 2) Prepare the data path (similar to setBoundValue, though here it's direct)
              // If you needed parentBinding / itemIndex / childField, you'd replicate that logic.
              const binding = dataModelBinding;

              // 3) Ensure the data at binding is an array
              let currentValue = dot.pick(binding, draft.data);

              if (!Array.isArray(currentValue)) {
                currentValue = [];
                dot.set(binding, currentValue, {});
              }

              // 4) Build a new row object with each key = null
              const newRow: Record<string, any> = {};
              for (const key of Object.keys(property.properties)) {
                newRow[key] = null;
              }

              // 5) Push the new row to the array
              currentValue.push(newRow);
            }),
          );
        },
      }),
      {
        name: 'LayoutStore',
      },
    ),
  ),
);
