import dot from 'dot-object';
import { createSelector } from 'reselect';
import { createStore } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { evaluateExpression } from 'src/next/app/expressions/evaluateExpression';
import { moveChildren } from 'src/next/app/utils/moveChildren';
import { isInitialState } from 'src/next/types/InitialState/initialStateTypeChecker';
import type { Expression, ExprVal, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { AllComponents, ILayoutCollection } from 'src/layout/layout';
import type { TextResource } from 'src/next/app/api';
import type { ApplicationMetadata, InitialState, IParty, IProfile } from 'src/next/types/InitialState/InitialState';
import type { InstanceDTO } from 'src/next/types/InstanceDTO';
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

interface MegaStore extends InitialState {
  instance?: InstanceDTO;
  layoutSetsConfig: LayoutSetsSchema;
  process: ProcessSchema;
  pageOrder: PageOrderDTO;
  layouts: ResolvedLayoutCollection;
  resolvedLayouts: ResolvedLayoutCollection;
  data: DataObject | undefined;
  textResource?: TextResource;
  setInstance: (instance: InstanceDTO) => void;
  setLayoutSets: (schema: LayoutSetsSchema) => void;
  setProcess: (proc: ProcessSchema) => void;
  setPageOrder: (order: PageOrderDTO) => void;
  setLayouts: (layouts: ILayoutCollection) => void;
  setDataObject: (data: DataObject) => void;
  setDataValue: (key: string, value: string | boolean) => void;
  updateResolvedLayouts: () => void;
  evaluateExpression: (expr: Expression) => any;
  setApplicationMetadata: (metadata: ApplicationMetadata) => void;
  setUser: (user: IProfile) => void;
  setValidParties: (parties: IParty[]) => void;
  setTextResource: (textResource: TextResource) => void;
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
  [(state: MegaStore) => state.layouts, (state: MegaStore) => state.data],
  (layouts, data) => {
    if (!layouts) {
      return {};
    }
    return rebuildResolvedLayouts(layouts, data);
  },
);

const getInitialState = (): InitialState => {
  const windowValid =
    typeof window !== 'undefined' && (window as unknown as { __INITIAL_STATE__: unknown }).__INITIAL_STATE__;

  if (!windowValid) {
    throw new Error('window invalid');
  }

  const state = (window as unknown as { __INITIAL_STATE__: unknown }).__INITIAL_STATE__;

  if (!isInitialState(state)) {
    throw new Error('State is invalid');
  }

  return {
    ...state,
    //componentConfigs: getComponentConfigs(),
  };
};

export const megaStore = createStore<MegaStore>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        ...getInitialState(),
        instance: undefined,
        data: undefined,

        // updateResolvedLayouts: () => {
        //   // Use our memoized selector:
        //   const newResolved = selectResolvedLayouts(get());
        //   set({ resolvedLayouts: newResolved });
        // },

        setInstance: (instance: InstanceDTO) => {
          set({ instance });
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
        setApplicationMetadata: (metadata) => set({ applicationMetadata: metadata }),
        setUser: (user) => set({ user }),
        setValidParties: (parties) => set({ validParties: parties }),
        setTextResource: (textResource) => set(() => ({ textResource })),
      }),
      {
        name: 'MegaStore',
      },
    ),
  ),
);
