import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import dot from 'dot-object';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { StoreApi } from 'zustand';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { Loader } from 'src/core/loading/Loader';
import { shouldUpdate } from 'src/features/form/dynamics/conditionalRendering';
import { useDynamics } from 'src/features/form/dynamics/DynamicsContext';
import { useHiddenLayoutsExpressions } from 'src/features/form/layout/LayoutsContext';
import { useHiddenPages, useSetHiddenPages } from 'src/features/form/layout/PageNavigationContext';
import { getLayoutComponentObject } from 'src/layout';
import { runConditionalRenderingRules } from 'src/utils/conditionalRendering';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { isNodeRef } from 'src/utils/layout/nodeRef';
import { NodesGenerator } from 'src/utils/layout/NodesGenerator';
import type { NodeRef } from 'src/layout';
import type { CompTypes, LayoutNodeFromObj } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { ItemStore, ItemStoreFromNode } from 'src/utils/layout/types';

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

export interface PageStore {
  type: 'page';
  hidden: boolean;
  topLevelNodes: TopLevelNodesStore;
}

export interface TopLevelNodesStore<Types extends CompTypes = CompTypes> {
  [key: string]: ItemStore<Types>;
}

export interface NodesDataContext {
  pages: PageHierarchy;
  addTopLevelNode: <N extends LayoutNode>(node: N, state: any) => void;
  removeTopLevelNode: (node: LayoutNode) => void;
  setNodeProp: <N extends LayoutNode, K extends keyof ItemStoreFromNode<N>>(
    node: N,
    prop: K,
    value: ItemStoreFromNode<N>[K],
  ) => void;

  addPage: (pageKey: string) => void;
  removePage: (pageKey: string) => void;
  setPageProp: <K extends keyof PageStore>(pageKey: string, prop: K, value: PageStore[K]) => void;
}

/**
 * Function that takes a source object and sets every property on the target object to the same value.
 * Use this utility to make sure immer can avoid updating state whenever the value of a property is the same.
 */
function setEveryProperty(obj: any, target: any) {
  let changed = false;
  const map = dot.dot(obj);
  for (const [key, value] of Object.entries(map)) {
    const previous = dot.pick(key, target);
    if (previous !== value) {
      console.log('debug, path changed', key, 'was', previous, 'now', value);
      dot.str(key, value, target);
      changed = true;
    }
  }

  return changed;
}

export type NodesDataStore = StoreApi<NodesDataContext>;
export function createNodesDataStore() {
  return createStore<NodesDataContext>()(
    immer((set) => ({
      pages: {
        type: 'pages' as const,
        pages: {},
      },
      addTopLevelNode: (node, state) =>
        set((s) => {
          const parentPath = node.path.slice(0, -1);
          const parent = pickNodePath(s.pages, parentPath);
          parent.topLevelNodes[node.getId()] = state;
        }),
      removeTopLevelNode: (node) =>
        set((s) => {
          const parentPath = node.path.slice(0, -1);
          const parent = pickNodePath(s.pages, parentPath);
          delete parent.topLevelNodes[node.getId()];
        }),
      setNodeProp: (node, prop, value) =>
        set((state) => {
          const obj = pickNodePath(state.pages, node.path);
          const changed = setEveryProperty(value, obj[prop]);
          changed && console.log('debug, One or more properties changed in node', node.path);
        }),
      addPage: (pageKey) =>
        set((state) => {
          if (state.pages.pages[pageKey]) {
            console.log('debug, ignoring add page', pageKey);
            return;
          }

          state.pages.pages[pageKey] = {
            type: 'page',
            hidden: false,
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
          const changed = setEveryProperty(value, obj[prop]);
          changed && console.log('debug, One or more properties changed in page', pageKey);
        }),
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

export const NodesProvider = (props: React.PropsWithChildren) => (
  <NodesStore.Provider>
    <DataStore.Provider>
      <NodesGenerator />
      <InnerHiddenComponentsProvider />
      <BlockUntilLoaded>{props.children}</BlockUntilLoaded>
    </DataStore.Provider>
  </NodesStore.Provider>
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
    return <Loader reason='nodes' />;
  }
  return <>{children}</>;
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

export type IsHiddenViaRulesSelector = ReturnType<typeof useIsHiddenViaRules>;
export function useIsHiddenViaRules() {
  return NodesStore.useDelayedMemoSelectorFactory({
    selector: (nodeId: string | NodeRef) => (state) =>
      state.hiddenViaRules.has(isNodeRef(nodeId) ? nodeId.nodeRef : nodeId),
    makeCacheKey: (nodeId) => (isNodeRef(nodeId) ? nodeId.nodeRef : nodeId),
  });
}

/**
 * A set of tools, selectors and functions to use internally in node generator components.
 */
export const NodesInternal = {
  useNodesStore: () => NodesStore.useStore(),
  useDataStore: () => DataStore.useStore(),
  useSetNodes: () => NodesStore.useSelector((s) => s.setNodes),
  useAddPage: () => DataStore.useSelector((s) => s.addPage),
  useRemovePage: () => DataStore.useSelector((s) => s.removePage),
  useAddTopLevelNode: () => DataStore.useSelector((s) => s.addTopLevelNode),
  useRemoveTopLevelNode: () => DataStore.useSelector((s) => s.removeTopLevelNode),
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
export function pickNodePath(
  container: PageHierarchy | PageStore | ItemStore<CompTypes>,
  path: string[],
  parentPath: string[] = [],
): ItemStore<any> | PageStore {
  if (path.length === 0) {
    if (parentPath.length === 0) {
      throw new Error('Cannot pick root node');
    }

    return container;
  }

  const [target, ...remaining] = path;
  if (!target) {
    throw new Error('Invalid leg in path');
  }
  const fullPath = [...parentPath, target];

  if (isPages(container)) {
    const page = container.pages[target];
    if (!page) {
      throw new Error(`Page not found at path /${fullPath.join('/')}`);
    }
    return pickNodePath(page, remaining, fullPath);
  }

  if (isPage(container)) {
    const node = container.topLevelNodes[target];
    if (!node) {
      throw new Error(`Top level node not found at path /${fullPath.join('/')}`);
    }
    return pickNodePath(node, remaining, fullPath);
  }

  const def = getLayoutComponentObject(container.layout.type);
  if (!def) {
    throw new Error(`Component type "${container.layout.type}" not found`);
  }

  return def.pickChild(container as ItemStore<any>, remaining, fullPath);
}

function isPages(state: PageHierarchy | PageStore | ItemStore<CompTypes>): state is PageHierarchy {
  return 'type' in state && state.type === 'pages';
}

function isPage(state: PageHierarchy | PageStore | ItemStore<CompTypes>): state is PageStore {
  return 'type' in state && state.type === 'page';
}
