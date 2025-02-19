import dot from 'dot-object';
import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { evaluateExpression } from 'src/next/app/expressions/evaluateExpression';
import { moveChildren } from 'src/next/app/utils/moveChildren';
import type { ExprVal, ExprValToActualOrExpr } from 'src/features/expressions/types';
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
  children?: ResolvedCompExternal[];
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
  // setters
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
    // 1. Get the data for the children
    // 2. For each entry in the data array, send that data along with the children layot to resolvePageLayoutComponents

    let resolvedChildren: ResolvedCompExternal[] = [];

    if (component.children) {
      //debugger;
      // @ts-ignore
      const dataModelBinding = component.dataModelBindings['group'];
      const dataForKids = dot.pick(dataModelBinding, data);
      const mappedKids = dataForKids.map((currentData) =>
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

export const layoutStore = createStore<Layouts>()(
  devtools(
    (set, get) => ({
      data: undefined,
      updateResolvedLayouts: () => {
        const { layouts, data } = get();
        if (!layouts) {
          return;
        }

        const before = dot.pick('rapport.innsender.foretak.organisasjonsnummer', data);

        console.log('before', before);
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
        get().updateResolvedLayouts();
      },

      // Setting data => also update resolved
      setDataObject: (newData) => {
        set({ data: newData });
        get().updateResolvedLayouts();
      },

      setDataValue: (dataKeyToUpdate: string, newValue: string) => {
        set((state) => {
          const dataCopy = structuredClone(state.data);

          if (!dataCopy) {
            throw new Error('no data copy');
          }

          dot.set(dataKeyToUpdate, newValue, dataCopy);

          return {
            data: dataCopy,
          };
        });
        get().updateResolvedLayouts();
      },
    }),
    { name: 'LayoutStore' },
  ),
);
