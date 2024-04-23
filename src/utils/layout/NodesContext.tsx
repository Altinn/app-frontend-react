import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { UnionToIntersection } from 'utility-types';
import type { StoreApi } from 'zustand';

import { ContextNotProvided } from 'src/core/contexts/context';
import { createZustandContext } from 'src/core/contexts/zustandContext';
import { Loader } from 'src/core/loading/Loader';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { shouldUpdate } from 'src/features/form/dynamics/conditionalRendering';
import { useDynamics } from 'src/features/form/dynamics/DynamicsContext';
import { useHiddenLayoutsExpressions } from 'src/features/form/layout/LayoutsContext';
import { useHiddenPages, useSetHiddenPages } from 'src/features/form/layout/PageNavigationContext';
import { useLaxLayoutSettings, useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { UpdateExpressionValidation } from 'src/features/validation/validationContext';
import { ValidationStorePlugin } from 'src/features/validation/ValidationStorePlugin';
import { useCurrentView } from 'src/hooks/useNavigatePage';
import { getComponentDef } from 'src/layout';
import { runConditionalRenderingRules } from 'src/utils/conditionalRendering';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { isNodeRef } from 'src/utils/layout/nodeRef';
import { NodesGenerator } from 'src/utils/layout/NodesGenerator';
import { NodeStagesProvider } from 'src/utils/layout/NodeStages';
import type { ValidationStorePluginConfig } from 'src/features/validation/ValidationStorePlugin';
import type { NodeRef } from 'src/layout';
import type { CompTypes, LayoutNodeFromObj } from 'src/layout/layout';
import type { ItemStore, ItemStoreFromNode } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';

export interface NodesContext {
  nodes: LayoutPages | undefined;
  setNodes: (nodes: LayoutPages) => void;

  hiddenViaRules: Set<string>;
  setHiddenViaRules: (mutator: (hidden: Set<string>) => Set<string>) => void;
}

export type NodesStore = ReturnType<typeof createNodesStore>;
function createNodesStore() {
  return createStore<NodesContext>((set) => ({
    nodes: undefined,
    setNodes: (nodes: LayoutPages) => set({ nodes }),

    hiddenViaRules: new Set(),
    setHiddenViaRules: (mutator: (currentlyHidden: Set<string>) => Set<string>) =>
      set((state) => ({ hiddenViaRules: mutator(state.hiddenViaRules) })),
  }));
}

export interface PageHierarchy {
  type: 'pages';
  pages: PageStores;
}

interface PageStores {
  [key: string]: PageStore;
}

export interface HiddenStatePage {
  parent: undefined;
  hiddenByRules: false;
  hiddenByExpression: boolean;
  hiddenByTracks: boolean;
}

export interface HiddenStateNode {
  parent: HiddenState;
  hiddenByRules: boolean;
  hiddenByExpression: boolean;
  hiddenByTracks: false;
}

export type HiddenState = HiddenStatePage | HiddenStateNode;

export interface PageStore {
  type: 'page';
  hidden: HiddenStatePage;
  topLevelNodes: TopLevelNodesStore;
}

export interface TopLevelNodesStore<Types extends CompTypes = CompTypes> {
  [key: string]: ItemStore<Types>;
}

export type NodeDataStorePlugins = {
  validation: ValidationStorePluginConfig;
};

const DataStorePlugins: { [K in keyof NodeDataStorePlugins]: NodeDataPlugin<NodeDataStorePlugins[K]> } = {
  validation: new ValidationStorePlugin(),
};

type AllFlat<T> = UnionToIntersection<T extends Record<string, infer U> ? U : never>;
type ExtraFunctions = AllFlat<{
  [K in keyof NodeDataStorePlugins]: NodeDataStorePlugins[K]['extraFunctions'];
}>;
type ExtraHooks = AllFlat<{
  [K in keyof NodeDataStorePlugins]: NodeDataStorePlugins[K]['extraHooks'];
}>;

export type NodesDataContext = {
  pages: PageHierarchy;
  addNode: <N extends LayoutNode>(node: N, targetState: any) => void;
  removeNode: (node: LayoutNode) => void;
  setNodeProp: <N extends LayoutNode, K extends keyof ItemStoreFromNode<N>>(
    node: N,
    prop: K,
    value: ItemStoreFromNode<N>[K],
  ) => void;

  addPage: (pageKey: string) => void;
  removePage: (pageKey: string) => void;
  setPageProp: <K extends keyof PageStore>(pageKey: string, prop: K, value: PageStore[K]) => void;
} & ExtraFunctions;

export type NodesDataStore = StoreApi<NodesDataContext>;
export function createNodesDataStore() {
  return createStore<NodesDataContext>()(
    immer((set) => ({
      pages: {
        type: 'pages' as const,
        pages: {},
      },
      addNode: (node, targetState) =>
        set((s) => {
          const parentPath = node.path.slice(0, -1);
          const parent = pickDataStorePath(s.pages, parentPath);
          console.log(`debug, adding node /${node.path.join('/')}`);
          if (parent.type === 'page') {
            const id = node.getId();
            if (parent.topLevelNodes[id]) {
              throw new Error(`Node already exists: ${id}`);
            }
            parent.topLevelNodes[id] = targetState;
          } else {
            const def = getComponentDef(parent.layout.type);
            targetState.ready = { hiddenSet: false, expressionsEvaluated: false };
            def.addChild(parent as any, node, targetState);
          }
        }),
      removeNode: (node) =>
        set((s) => {
          const parentPath = node.path.slice(0, -1);
          const parent = pickDataStorePath(s.pages, parentPath);
          console.log(`debug, removing node /${node.path.join('/')}`);
          if (parent.type === 'page') {
            delete parent.topLevelNodes[node.getId()];
          } else {
            const def = getComponentDef(parent.layout.type);
            def.removeChild(parent as any, node);
          }
        }),
      setNodeProp: (node, prop, value) =>
        set((state) => {
          const obj = pickDataStorePath(state.pages, node.path);
          if (obj.type === 'page') {
            throw new Error('Parent node is not a node');
          }
          Object.assign(obj, { [prop]: value });
        }),
      addPage: (pageKey) =>
        set((state) => {
          if (state.pages.pages[pageKey]) {
            return;
          }

          state.pages.pages[pageKey] = {
            type: 'page',
            hidden: {
              parent: undefined,
              hiddenByRules: false,
              hiddenByExpression: false,
              hiddenByTracks: false,
            },
            topLevelNodes: {},
          };
        }),
      removePage: (pageKey) =>
        set((state) => {
          delete state.pages.pages[pageKey];
        }),
      setPageProp: (pageKey, prop, value) =>
        set((state) => {
          const obj = state.pages.pages[pageKey];
          Object.assign(obj, { [prop]: value });
        }),

      ...(Object.values(DataStorePlugins)
        .map((plugin) => plugin.extraFunctions(set))
        .reduce((acc, val) => ({ ...acc, ...val }), {}) as ExtraFunctions),
    })),
  );
}

const NodesStore = createZustandContext({
  name: 'Nodes',
  required: true,
  initialCreateStore: createNodesStore,
});

const DataStore = createZustandContext<NodesDataStore, NodesDataContext>({
  name: 'NodesData',
  required: true,
  initialCreateStore: createNodesDataStore,
});
export type NodesDataStoreFull = typeof DataStore;

export const NodesProvider = (props: React.PropsWithChildren) => (
  <NodeStagesProvider>
    <NodesStore.Provider>
      <DataStore.Provider>
        <NodesGenerator />
        <InnerHiddenComponentsProvider />
        <UpdateExpressionValidation />
        <BlockUntilLoaded>{props.children}</BlockUntilLoaded>
      </DataStore.Provider>
    </NodesStore.Provider>
  </NodeStagesProvider>
);

function InnerHiddenComponentsProvider() {
  const setHidden = NodesStore.useSelector((state) => state.setHiddenViaRules);
  const resolvedNodes = NodesStore.useSelector((state) => state.nodes);

  useLegacyHiddenComponents(resolvedNodes, setHidden);

  return null;
}

function BlockUntilLoaded({ children }: PropsWithChildren) {
  const hasNodes = NodesStore.useSelector((state) => !!state.nodes);
  if (!hasNodes) {
    return <NodesLoader />;
  }
  return <>{children}</>;
}

function NodesLoader() {
  return <Loader reason='nodes' />;
}

type MaybeNodeRef = string | NodeRef | undefined | null;
type RetValFromNodeRef<T extends MaybeNodeRef> = T extends undefined
  ? undefined
  : T extends null
    ? null
    : T extends NodeRef
      ? LayoutNode
      : T extends string
        ? LayoutNode
        : never;

/**
 * Use the expression context. This will return a LayoutPages object containing the full tree of resolved
 * nodes (meaning, instances of layout components in a tree, with their expressions evaluated and resolved to
 * scalar values).
 *
 * Usually, if you're looking for a specific component/node, useResolvedNode() is better.
 */
export function useNode<T extends string | NodeRef | undefined>(idOrRef: T): RetValFromNodeRef<T> {
  const node = NodesStore.useSelector((s) => s.nodes?.findById(isNodeRef(idOrRef) ? idOrRef.nodeRef : idOrRef));
  return node as RetValFromNodeRef<T>;
}

export const useNodes = () => NodesStore.useSelector((s) => s.nodes!);
export const useNodesAsRef = () => NodesStore.useSelectorAsRef((s) => s.nodes!);
export const useNodesAsLaxRef = () => NodesStore.useLaxSelectorAsRef((s) => s.nodes!);

export function useNodesMemoSelector<U>(selector: (s: LayoutPages) => U) {
  return NodesStore.useMemoSelector((state) => selector(state.nodes!));
}

export type NodeSelector = ReturnType<typeof useNodeSelector>;
export function useNodeSelector() {
  return NodesStore.useDelayedMemoSelectorFactory({
    selector: (nodeId: string | NodeRef) => (state) =>
      state.nodes?.findById(isNodeRef(nodeId) ? nodeId.nodeRef : nodeId),
    makeCacheKey: (nodeId) => (isNodeRef(nodeId) ? nodeId.nodeRef : nodeId),
  });
}

export interface IsHiddenOptions {
  /**
   * Default = true. Set this to false to not check if DevTools have overridden hidden status.
   */
  respectDevTools?: boolean;

  /**
   * Default = false. Set this to true to consider pages hidden from the page order as actually hidden.
   */
  respectTracks?: boolean;
}

function isHidden(state: HiddenState | undefined, forcedVisibleByDevTools: boolean, options?: IsHiddenOptions) {
  if (!state) {
    return true;
  }

  const { respectDevTools = true, respectTracks = false } = options ?? {};
  if (forcedVisibleByDevTools && respectDevTools) {
    return true;
  }

  const hiddenHere = state.hiddenByRules || state.hiddenByExpression || (respectTracks && state.hiddenByTracks);
  if (hiddenHere) {
    return true;
  }

  if (state.parent) {
    return isHidden(state.parent, forcedVisibleByDevTools, options);
  }
  return false;
}

export type IsHiddenSelector = ReturnType<typeof Hidden.useIsHiddenSelector>;
export const Hidden = {
  useIsHidden: (node: LayoutNode | LayoutPage, options?: IsHiddenOptions) => {
    const forcedVisibleByDevTools = Hidden.useIsForcedVisibleByDevTools();
    return DataStore.useMemoSelector((s) =>
      isHidden(pickDataStorePath(s.pages, node).hidden, forcedVisibleByDevTools, options),
    );
  },
  useIsHiddenSelector: () => {
    const nodes = useNodes();
    const forcedVisibleByDevTools = Hidden.useIsForcedVisibleByDevTools();
    return DataStore.useDelayedMemoSelectorFactory({
      selector:
        ({ node, options }: { node: string | NodeRef | LayoutNode | LayoutPage; options?: IsHiddenOptions }) =>
        (state) => {
          try {
            const nodeState = pickDataStorePath(state.pages, getNodePath(node, nodes));
            return isHidden(nodeState.hidden, forcedVisibleByDevTools, options);
          } catch (e) {
            if (e instanceof NodePathNotFound) {
              return true;
            }
            throw e;
          }
        },
      makeCacheKey: ({ node }) => getNodePath(node, nodes).join('/'),
    });
  },

  /**
   * The next ones are primarily for internal use:
   */
  useIsHiddenViaRules: (node: LayoutNode) =>
    NodesStore.useSelector((s) => s.hiddenViaRules.has(node.getId()) || s.hiddenViaRules.has(node.getBaseId())),
  useIsForcedVisibleByDevTools: () => {
    const devToolsIsOpen = useDevToolsStore((state) => state.isOpen);
    const devToolsHiddenComponents = useDevToolsStore((state) => state.hiddenComponents);

    return devToolsIsOpen && devToolsHiddenComponents !== 'hide';
  },
  useIsPageHiddenViaTracks: (pageKey: string) => {
    const currentView = useCurrentView();
    const maybeLayoutSettings = useLaxLayoutSettings();
    const orderWithHidden = maybeLayoutSettings === ContextNotProvided ? [] : maybeLayoutSettings.pages.order;
    const isHiddenByTracks = !orderWithHidden.includes(pageKey);
    const layoutSettings = useLayoutSettings();

    if (pageKey === currentView) {
      // If this is the current view, then it's never hidden. This avoids settings fields as hidden when
      // code caused this to be the current view even if it's not in the common order.
      return false;
    }

    if (layoutSettings.pages.pdfLayoutName && pageKey === layoutSettings.pages.pdfLayoutName) {
      // If this is the pdf layout, then it's never hidden.
      return false;
    }

    return isHiddenByTracks;
  },
};

function getNodePath(nodeId: string | NodeRef | LayoutNode | LayoutPage, nodes: LayoutPages) {
  const node = isNodeRef(nodeId)
    ? nodes.findById(nodeId.nodeRef)
    : typeof nodeId === 'string'
      ? nodes.findById(nodeId)
      : nodeId;

  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  return node instanceof LayoutPage ? [node.pageKey] : node.path;
}

/**
 * A set of tools, selectors and functions to use internally in node generator components.
 */
export const NodesInternal = {
  useNodeStateSelector<N extends LayoutNode | undefined, Out>(
    node: N,
    selector: (state: ItemStoreFromNode<N>) => Out,
  ): N extends undefined ? Out | undefined : Out {
    return DataStore.useSelector((s) => (node ? selector(pickDataStorePath(s.pages, node)) : undefined)) as any;
  },

  useIsAdded: (node: LayoutNode | LayoutPage) =>
    DataStore.useSelector((s) => {
      try {
        pickDataStorePath(s.pages, node);
        return true;
      } catch (e) {
        if (e instanceof NodePathNotFound) {
          return false;
        }
        throw e;
      }
    }),
  useNodesStore: () => NodesStore.useStore(),
  useDataStoreFor: (node: LayoutNode) =>
    DataStore.useSelector((s) => {
      try {
        return pickDataStorePath(s.pages, node);
      } catch (e) {
        if (e instanceof NodePathNotFound) {
          return undefined;
        }
        throw e;
      }
    }),
  useDataStore: () => DataStore.useStore(),
  useSetNodeProp: () => DataStore.useSelector((s) => s.setNodeProp),
  useSetNodes: () => NodesStore.useSelector((s) => s.setNodes),
  useAddPage: () => DataStore.useSelector((s) => s.addPage),
  useSetPageProp: () => DataStore.useSelector((s) => s.setPageProp),
  useRemovePage: () => DataStore.useSelector((s) => s.removePage),
  useAddNode: () => DataStore.useSelector((s) => s.addNode),
  useRemoveNode: () => DataStore.useSelector((s) => s.removeNode),

  ...(Object.values(DataStorePlugins)
    .map((plugin) => plugin.extraHooks(DataStore))
    .reduce((acc, val) => ({ ...acc, ...val }), {}) as ExtraHooks),
};

/**
 * Given a selector, get a LayoutNode object
 *
 * @param selector This can be one of:
 *  - A component-like structure, such as ILayoutComponent, or ILayoutCompInput. The 'id' property is used to find the
 *    corresponding LayoutNode object for you, while also inferring a more specific type (if you have one).
 *  - A component id, like 'currentValue-0' for the 'currentValue' component in the first row of the repeating group it
 *    belongs to. If you only provide 'currentValue', and the component is still inside a repeating group, most likely
 *    you'll get the first row item as a result.
 */
export function useResolvedNode<T>(selector: string | undefined | T | LayoutNode): LayoutNodeFromObj<T> | undefined {
  const nodes = useNodes();

  if (typeof selector === 'object' && selector !== null && selector instanceof BaseLayoutNode) {
    return selector as any;
  }

  if (typeof selector === 'string') {
    return nodes?.findById(selector) as any;
  }

  if (typeof selector == 'object' && selector !== null && 'id' in selector && typeof selector.id === 'string') {
    return nodes?.findById(selector.id) as any;
  }

  return undefined;
}

/**
 * This hook replaces checkIfConditionalRulesShouldRunSaga(), and fixes a problem that was hard to solve in sagas;
 * namely, that expressions that cause a component to suddenly be visible might also cause other component lookups
 * to start producing a value, so we don't really know how many times we need to run the expressions to reach
 * a stable state. As React hooks are...reactive, we can just run the expressions again when the data changes, and
 * thus continually run the expressions until they stabilize. You _could_ run into an infinite loop if you
 * have a circular dependency in your expressions, but that's a problem with your form, not this hook.
 */
function useLegacyHiddenComponents(
  resolvedNodes: LayoutPages | undefined,
  setHidden: React.Dispatch<React.SetStateAction<Set<string>>>,
) {
  const rules = useDynamics()?.conditionalRendering ?? null;
  const dataSources = useExpressionDataSources();
  const hiddenExpr = useHiddenLayoutsExpressions();
  const hiddenPages = useHiddenPages();
  const setHiddenPages = useSetHiddenPages();

  useEffect(() => {
    if (!resolvedNodes) {
      return;
    }

    let futureHiddenFields: Set<string>;
    try {
      futureHiddenFields = runConditionalRenderingRules(rules, resolvedNodes, dataSources.formDataSelector);
    } catch (error) {
      window.logError('Error while evaluating conditional rendering rules:\n', error);
      futureHiddenFields = new Set();
    }

    setHidden((currentlyHidden) => {
      if (shouldUpdate(currentlyHidden, futureHiddenFields)) {
        return futureHiddenFields;
      }
      return currentlyHidden;
    });
  }, [dataSources, hiddenPages, hiddenExpr, resolvedNodes, rules, setHiddenPages, setHidden]);
}

/**
 * Recursive function to look up a node stored in the page hierarchy. Components may store their children
 * in different ways, so this function has to call out to each component specific implementation to look up
 * children.
 */
export function pickDataStorePath(
  container: PageHierarchy | PageStore | ItemStore,
  _pathOrNode: string[] | LayoutNode | LayoutPage,
  parentPath: string[] = [],
): ItemStore | PageStore {
  const path =
    _pathOrNode instanceof LayoutPage
      ? [_pathOrNode.pageKey]
      : _pathOrNode instanceof BaseLayoutNode
        ? _pathOrNode.path
        : _pathOrNode;

  if (path.length === 0) {
    if (parentPath.length === 0) {
      throw new Error('Cannot pick root node');
    }

    return container as ItemStore | PageStore;
  }

  const [target, ...remaining] = path;
  if (!target) {
    throw new Error('Invalid leg in path');
  }
  const fullPath = [...parentPath, target];

  if (isPages(container)) {
    const page = container.pages[target];
    if (!page) {
      throw new NodePathNotFound(`Page not found at path /${fullPath.join('/')}`);
    }
    return pickDataStorePath(page, remaining, fullPath);
  }

  if (isPage(container)) {
    const node = container.topLevelNodes[target];
    if (!node) {
      throw new NodePathNotFound(`Top level node not found at path /${fullPath.join('/')}`);
    }
    return pickDataStorePath(node, remaining, fullPath);
  }

  const def = getComponentDef(container.layout.type);
  if (!def) {
    throw new Error(`Component type "${container.layout.type}" not found`);
  }

  const child = def.pickChild(container as ItemStore<any>, target, fullPath);
  return pickDataStorePath(child, remaining, fullPath);
}

function isPages(state: PageHierarchy | PageStore | ItemStore): state is PageHierarchy {
  return 'type' in state && state.type === 'pages';
}

function isPage(state: PageHierarchy | PageStore | ItemStore): state is PageStore {
  return 'type' in state && state.type === 'page';
}
