import { subscribeWithSelector } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import type {
  BaseComponent,
  LayoutCollection,
  LayoutFile,
  LayoutSet,
  LayoutSetsConfig,
  PageOrder,
  ResolvedComponent,
  ResolvedLayoutCollection,
} from '../../types';

export interface LayoutStore {
  // Layout sets configuration
  layoutSetsConfig: LayoutSetsConfig | undefined;

  // Page ordering
  pageOrder: PageOrder | undefined;

  // All layouts keyed by page ID
  layouts: LayoutCollection;

  // Resolved layouts with component hierarchy
  resolvedLayouts: ResolvedLayoutCollection;

  // Component lookup map for fast access
  componentMap: Record<string, ResolvedComponent>;

  // Current state
  currentLayoutSet: string;
  currentPage: string;

  // Methods
  setLayoutSetsConfig: (config: LayoutSetsConfig) => void;
  setPageOrder: (order: PageOrder) => void;
  setLayouts: (layouts: LayoutCollection) => void;
  setCurrentLayoutSet: (layoutSetId: string) => void;
  setCurrentPage: (pageId: string) => void;
  getLayout: (pageId: string) => ResolvedComponent[];
  getComponent: (componentId: string) => ResolvedComponent | undefined;
  getLayoutSet: (layoutSetId: string) => LayoutSet | undefined;
  getPageList: () => string[];
  updateComponentVisibility: (componentId: string, hidden: boolean) => void;
  resolveLayouts: () => void;
  reset: () => void;
}

const initialState = {
  layoutSetsConfig: undefined,
  pageOrder: undefined,
  layouts: {},
  resolvedLayouts: {},
  componentMap: {},
  currentLayoutSet: '',
  currentPage: '',
};

export const createLayoutStore = () =>
  createStore<LayoutStore>()(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      setLayoutSetsConfig: (config) => {
        set({ layoutSetsConfig: config });
        // Set default layout set if available
        if (config.sets.length > 0 && !get().currentLayoutSet) {
          set({ currentLayoutSet: config.sets[0].id });
        }
      },

      setPageOrder: (order) => {
        set({ pageOrder: order });
        // Set default page if available
        if (order.pages?.order?.length > 0 && !get().currentPage) {
          set({ currentPage: order.pages.order[0] });
        }
      },

      setLayouts: (layouts) => {
        set({ layouts });
        get().resolveLayouts();
      },

      setCurrentLayoutSet: (layoutSetId) => set({ currentLayoutSet: layoutSetId }),

      setCurrentPage: (pageId) => set({ currentPage: pageId }),

      getLayout: (pageId) => {
        const state = get();
        return state.resolvedLayouts[pageId] || [];
      },

      getComponent: (componentId) => {
        const state = get();
        return state.componentMap[componentId];
      },

      getLayoutSet: (layoutSetId) => {
        const config = get().layoutSetsConfig;
        if (!config) return undefined;
        return config.sets.find((set) => set.id === layoutSetId);
      },

      getPageList: () => {
        const order = get().pageOrder;
        if (!order?.pages?.order) return [];
        return order.pages.order;
      },

      updateComponentVisibility: (componentId, hidden) => {
        set((state) => {
          const component = state.componentMap[componentId];
          if (component) {
            component.hidden = hidden;
            // Trigger re-resolution if needed
            return { ...state, componentMap: { ...state.componentMap } };
          }
          return state;
        });
      },

      resolveLayouts: () => {
        const { layouts, layoutSetsConfig, currentLayoutSet } = get();
        const resolvedLayouts: ResolvedLayoutCollection = {};
        const componentMap: Record<string, ResolvedComponent> = {};

        // Helper function to process a component and its children
        const processComponent = (
          component: BaseComponent,
          pageId: string,
          layoutSetId?: string,
          parent?: string,
        ): ResolvedComponent => {
          const resolved: ResolvedComponent = {
            ...component,
            pageId,
            layoutSetId,
            parent,
            children: [],
          };

          // Register in component map
          componentMap[component.id] = resolved;

          // Process children for container components
          if (isContainerComponent(component.type)) {
            // In a real implementation, we'd process actual children
            // For now, we'll handle this in the service layer
          }

          return resolved;
        };

        // Process each page
        Object.entries(layouts).forEach(([pageId, layoutFile]) => {
          if (!layoutFile.data?.layout) {
            return;
          }

          const resolvedComponents: ResolvedComponent[] = [];

          // Determine layout set for this page
          let layoutSetId: string | undefined;
          if (layoutSetsConfig && currentLayoutSet) {
            const layoutSet = layoutSetsConfig.sets.find((set) => set.id === currentLayoutSet);
            if (layoutSet) {
              layoutSetId = layoutSet.id;
            }
          }

          // Process all components in the layout
          layoutFile.data.layout.forEach((component) => {
            const resolved = processComponent(component, pageId, layoutSetId);
            resolvedComponents.push(resolved);
          });

          resolvedLayouts[pageId] = resolvedComponents;
        });

        set({
          resolvedLayouts,
          componentMap,
        });
      },

      reset: () => set(initialState),
    })),
  );

// Helper function to determine if a component is a container
function isContainerComponent(type: string): boolean {
  const containerTypes = [
    'Group',
    'RepeatingGroup',
    'Grid',
    'ButtonGroup',
    'Accordion',
    'AccordionGroup',
    'Cards',
    'Tabs',
    'Likert',
  ];
  return containerTypes.includes(type);
}

export const layoutStore = createLayoutStore();