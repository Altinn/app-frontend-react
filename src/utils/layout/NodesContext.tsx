import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { PropsWithChildren } from 'react';

import deepEqual from 'fast-deep-equal';
import { produce } from 'immer';
import { createStore } from 'zustand';
import type { UnionToIntersection } from 'utility-types';
import type { StoreApi } from 'zustand';

import { ContextNotProvided } from 'src/core/contexts/context';
import { createZustandContext } from 'src/core/contexts/zustandContext';
import { Loader } from 'src/core/loading/Loader';
import { AttachmentsStorePlugin } from 'src/features/attachments/AttachmentsStorePlugin';
import { UpdateAttachmentsForCypress } from 'src/features/attachments/UpdateAttachmentsForCypress';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { shouldUpdate } from 'src/features/form/dynamics/conditionalRendering';
import { useDynamics } from 'src/features/form/dynamics/DynamicsContext';
import { useLaxLayoutSettings, useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { OptionsStorePlugin } from 'src/features/options/OptionsStorePlugin';
import {
  LoadingBlockerWaitForValidation,
  ProvideWaitForValidation,
  UpdateExpressionValidation,
} from 'src/features/validation/validationContext';
import { ValidationStorePlugin } from 'src/features/validation/ValidationStorePlugin';
import { SelectorStrictness, useDelayedSelector } from 'src/hooks/delayedSelectors';
import { useCurrentView } from 'src/hooks/useNavigatePage';
import { useWaitForState } from 'src/hooks/useWaitForState';
import { getComponentDef } from 'src/layout';
import { runConditionalRenderingRules } from 'src/utils/conditionalRendering';
import { GeneratorStages, GeneratorStagesProvider } from 'src/utils/layout/generator/GeneratorStages';
import { LayoutSetGenerator } from 'src/utils/layout/generator/LayoutSetGenerator';
import { GeneratorValidationProvider } from 'src/utils/layout/generator/validation/GenerationValidationContext';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { isNodeRef } from 'src/utils/layout/nodeRef';
import { RepeatingChildrenStorePlugin } from 'src/utils/layout/plugins/RepeatingChildrenStorePlugin';
import { useDataModelBindingTranspose } from 'src/utils/layout/useDataModelBindingTranspose';
import {
  useNodeTraversal,
  useNodeTraversalLax,
  useNodeTraversalSelector,
  useNodeTraversalSelectorSilent,
} from 'src/utils/layout/useNodeTraversal';
import type { AttachmentsStorePluginConfig } from 'src/features/attachments/AttachmentsStorePlugin';
import type { OptionsStorePluginConfig } from 'src/features/options/OptionsStorePlugin';
import type { ValidationStorePluginConfig } from 'src/features/validation/ValidationStorePlugin';
import type { DSReturn, InnerSelectorMode, OnlyReRenderWhen } from 'src/hooks/delayedSelectors';
import type { WaitForState } from 'src/hooks/useWaitForState';
import type { NodeRef } from 'src/layout';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { RepeatingChildrenStorePluginConfig } from 'src/utils/layout/plugins/RepeatingChildrenStorePlugin';
import type { GeneratorErrors, NodeData, NodeDataFromNode } from 'src/utils/layout/types';

// TODO: Wrap DataStore with more functions for selecting data only when ready (letting only the generators
// re-run when in a generation stage).
// TODO: Move the generator stages in here as well?

export interface PagesData {
  type: 'pages';
  pages: {
    [key: string]: PageData;
  };
}

export interface HiddenState {
  hiddenByRules: boolean;
  hiddenByExpression: boolean;
  hiddenByTracks: boolean;
}

export interface PageData {
  type: 'page';
  pageKey: string;
  hidden: HiddenState;
  errors: GeneratorErrors | undefined;
}

export type NodesStorePlugins = {
  validation: ValidationStorePluginConfig;
  options: OptionsStorePluginConfig;
  attachments: AttachmentsStorePluginConfig;
  repeatingChildren: RepeatingChildrenStorePluginConfig;
};

const StorePlugins: { [K in keyof NodesStorePlugins]: NodeDataPlugin<NodesStorePlugins[K]> } = {
  validation: new ValidationStorePlugin(),
  options: new OptionsStorePlugin(),
  attachments: new AttachmentsStorePlugin(),
  repeatingChildren: new RepeatingChildrenStorePlugin(),
};

type AllFlat<T> = UnionToIntersection<T extends Record<string, infer U> ? (U extends undefined ? never : U) : never>;
type ExtraFunctions = AllFlat<{
  [K in keyof NodesStorePlugins]: NodesStorePlugins[K]['extraFunctions'];
}>;
type ExtraHooks = AllFlat<{
  [K in keyof NodesStorePlugins]: NodesStorePlugins[K]['extraHooks'];
}>;

export interface AddNodeRequest<T extends CompTypes = CompTypes> {
  node: LayoutNode<T>;
  targetState: NodeData<T>;
}

export interface SetNodePropRequest<T extends CompTypes, K extends keyof NodeData<T>> {
  node: LayoutNode<T>;
  prop: K;
  value: NodeData<T>[K];
  partial?: boolean;
}

export type NodesDataContext = {
  // State
  ready: boolean;
  hasErrors: boolean;
  nodes: LayoutPages | undefined;
  pagesData: PagesData;
  nodeData: { [key: string]: NodeData };
  hiddenViaRules: Set<string>;

  // Functions
  setNodes: (nodes: LayoutPages) => void;
  addNodes: (requests: AddNodeRequest[]) => void;
  removeNode: (node: LayoutNode) => void;
  setNodeProps: (requests: SetNodePropRequest<CompTypes, keyof NodeData>[]) => void;
  addError: (error: string, node: LayoutPage | LayoutNode) => void;
  setHiddenViaRules: (mutator: (currentlyHidden: Set<string>) => Set<string>) => void;

  addPage: (pageKey: string) => void;
  removePage: (pageKey: string) => void;
  setPageProp: <K extends keyof PageData>(pageKey: string, prop: K, value: PageData[K]) => void;
  markReady: () => void;
} & ExtraFunctions;

export function ignoreNodePathNotFound<Ret>(fn: () => Ret, defaultReturnValue?: Ret): Ret {
  try {
    return fn();
  } catch (e) {
    if (e instanceof NodePathNotFound) {
      return defaultReturnValue as Ret;
    }
    throw e;
  }
}

export type NodesDataStore = StoreApi<NodesDataContext>;
export function createNodesDataStore() {
  return createStore<NodesDataContext>((set) => ({
    ready: false,
    hasErrors: false,
    nodes: undefined,
    pagesData: {
      type: 'pages',
      pages: {},
    },
    nodeData: {},

    hiddenViaRules: new Set(),
    setHiddenViaRules: (mutator: (currentlyHidden: Set<string>) => Set<string>) =>
      set((state) => ({ hiddenViaRules: mutator(state.hiddenViaRules) })),

    setNodes: (nodes) => set({ nodes }),
    addNodes: (requests) =>
      set((state) => {
        const nodeData = { ...state.nodeData };
        for (const { node, targetState } of requests) {
          nodeData[node.getId()] = targetState;

          const parentPath = node.path.slice(0, -1);
          const parent = pickDataStorePath({ ...state, nodeData }, parentPath);
          if (parent.type === 'node') {
            const def = getComponentDef(parent.layout.type);
            const additionalParentState = def.addChild(parent as any, node);
            nodeData[parent.layout.id] = {
              ...nodeData[parent.layout.id],
              ...(additionalParentState as any),
            };
          }
        }
        return { nodeData, ready: false };
      }),
    // TODO: Make a queue for this as well?
    removeNode: (node) =>
      set((state) => {
        const parentPath = node.path.slice(0, -1);
        const parent = pickDataStorePath(state, parentPath);
        if (parent.type === 'node') {
          const def = getComponentDef(parent.layout.type);
          def.removeChild(parent as any, node);
        }
        const nodeData = { ...state.nodeData };
        delete nodeData[node.getId()];
        return { nodeData, ready: false };
      }),
    setNodeProps: (requests) =>
      set((state) => {
        let changes = false;
        const nodeData = { ...state.nodeData };
        for (const { node, prop, value, partial } of requests) {
          const thisNode = { ...nodeData[node.getId()] };
          const prev = thisNode[prop as any];
          if (partial && value && prev && typeof prev === 'object' && typeof value === 'object') {
            thisNode[prop as any] = { ...thisNode[prop as any], ...value };
          } else {
            thisNode[prop as any] = value;
          }
          if (!deepEqual(thisNode[node.getId()][prop], thisNode[prop])) {
            changes = true;
            nodeData[node.getId()] = thisNode;
          }
        }
        return changes ? { nodeData } : {};
      }),
    addError: (error, node) =>
      set(
        produce((state) => {
          // TODO: Simplify this
          if (node instanceof LayoutPage) {
            if (!state.pages.pages[node.pageKey]) {
              return;
            }

            if (!state.pages.pages[node.pageKey].errors) {
              state.pages.pages[node.pageKey].errors = {};
            }
            state.pages.pages[node.pageKey].errors![error] = true;
            state.hasErrors = true;
            return;
          }

          const obj = state.flatNodes[node.getId()];
          if (!obj.errors) {
            obj.errors = {};
          }
          obj.errors[error] = true;

          // We need to mark the data as not ready as soon as an error is added, because GeneratorErrorBoundary
          // may need to remove the failing node from the tree before any more node traversal can happen safely.
          state.ready = false;

          state.hasErrors = true;
        }),
      ),
    addPage: (pageKey) =>
      set(
        produce((state) => {
          if (state.pages.pages[pageKey]) {
            return;
          }

          state.pages.pages[pageKey] = {
            type: 'page',
            pageKey,
            hidden: {
              hiddenByRules: false,
              hiddenByExpression: false,
              hiddenByTracks: false,
            },
            errors: undefined,
          };
          state.ready = false;
        }),
      ),
    removePage: (pageKey) =>
      set(
        produce((state) => {
          delete state.pages.pages[pageKey];
          state.ready = false;
        }),
      ),
    // TODO: Make a queue for this as well?
    setPageProp: (pageKey, prop, value) =>
      set(
        produce((state) => {
          const obj = state.pages.pages[pageKey];
          Object.assign(obj, { [prop]: value });
        }),
      ),
    markReady: () => set(() => ({ ready: true })),

    ...(Object.values(StorePlugins)
      .map((plugin) => plugin.extraFunctions(set))
      .reduce((acc, val) => ({ ...acc, ...val }), {}) as ExtraFunctions),
  }));
}
const Store = createZustandContext<NodesDataStore, NodesDataContext>({
  name: 'Nodes',
  required: true,
  initialCreateStore: createNodesDataStore,
});

export type NodesStoreFull = typeof Store;

export const NodesProvider = ({ children }: React.PropsWithChildren) => (
  <Store.Provider>
    <GeneratorStagesProvider>
      <GeneratorValidationProvider>
        <LayoutSetGenerator />
      </GeneratorValidationProvider>
      <InnerHiddenComponentsProvider />
      <MarkAsReady />
    </GeneratorStagesProvider>
    {window.Cypress && <UpdateAttachmentsForCypress />}
    <BlockUntilLoaded>
      <ProvideWaitForValidation />
      <UpdateExpressionValidation />
      <LoadingBlockerWaitForValidation>{children}</LoadingBlockerWaitForValidation>
    </BlockUntilLoaded>
  </Store.Provider>
);

function InnerHiddenComponentsProvider() {
  const setHidden = Store.useSelector((state) => state.setHiddenViaRules);
  useLegacyHiddenComponents(setHidden);

  return null;
}

/**
 * Some selectors (like NodeTraversal) only re-runs when the data store is 'ready', and when nodes start being added
 * or removed, the store is marked as not ready. This component will mark the store as ready when all nodes are added,
 * by waiting until after the render effects are done.
 *
 * This causes the node traversal selectors to re-run only when all nodes in a new repeating group row (and similar)
 * have been added.
 */
function MarkAsReady() {
  const markReady = Store.useSelector((s) => s.markReady);
  const isReady = Store.useSelector((s) => s.ready);
  const hasNodes = Store.useSelector((state) => !!state.nodes);
  const stagesFinished = GeneratorStages.useIsFinished();
  const shouldMarkAsReady = hasNodes && !isReady && stagesFinished;

  useEffect(() => {
    if (shouldMarkAsReady) {
      markReady();
    }
  }, [shouldMarkAsReady, markReady]);

  return null;
}

function BlockUntilLoaded({ children }: PropsWithChildren) {
  const hasNodes = Store.useSelector((state) => !!state.nodes);

  const isReady = Store.useSelector((s) => s.ready);
  const hasBeenReady = useRef(false);
  hasBeenReady.current = hasBeenReady.current || isReady;
  const stillLoading = !hasNodes || (!isReady && !hasBeenReady.current);

  if (stillLoading) {
    return <NodesLoader />;
  }

  return <>{children}</>;
}

function NodesLoader() {
  return <Loader reason='nodes' />;
}

type MaybeNodeRef = string | NodeRef | undefined | null | LayoutNode;
type RetValFromNodeRef<T extends MaybeNodeRef> = T extends LayoutNode
  ? T
  : T extends undefined
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
export function useNode<T extends string | NodeRef | undefined | LayoutNode>(idOrRef: T): RetValFromNodeRef<T> {
  const node = useNodeTraversal((traverser) =>
    idOrRef instanceof BaseLayoutNode ? idOrRef : traverser.findById(idOrRef),
  );
  return node as RetValFromNodeRef<T>;
}

export function useNodeLax<T extends string | NodeRef | undefined | LayoutNode>(
  idOrRef: T,
): RetValFromNodeRef<T> | typeof ContextNotProvided {
  const node = useNodeTraversalLax((traverser) =>
    traverser === ContextNotProvided
      ? ContextNotProvided
      : idOrRef instanceof BaseLayoutNode
        ? idOrRef
        : traverser.findById(idOrRef),
  );
  return node as RetValFromNodeRef<T> | typeof ContextNotProvided;
}

export const useNodes = () => Store.useSelector((s) => s.nodes!);
export const useNodesLax = () => Store.useLaxSelector((s) => s.nodes);

export type NodeSelector = ReturnType<typeof useNodeSelector>;
export function useNodeSelector() {
  const traversalSelector = useNodeTraversalSelector();
  return useCallback(
    (nodeId: string | NodeRef) => {
      const id = isNodeRef(nodeId) ? nodeId.nodeRef : nodeId;
      return traversalSelector((t) => t.findById(id), [id]);
    },
    [traversalSelector],
  );
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

function isHidden(
  state: NodesDataContext,
  nodeOrPath: string[] | LayoutNode | LayoutPage | undefined,
  forcedVisibleByDevTools: boolean,
  options?: IsHiddenOptions,
) {
  if (!nodeOrPath) {
    return true;
  }

  const hidden = pickDataStorePath(state, nodeOrPath)?.hidden;
  if (!hidden) {
    return true;
  }

  const { respectDevTools = true, respectTracks = false } = options ?? {};
  if (forcedVisibleByDevTools && respectDevTools) {
    return true;
  }

  const hiddenHere = hidden.hiddenByRules || hidden.hiddenByExpression || (respectTracks && hidden.hiddenByTracks);
  if (hiddenHere) {
    return true;
  }

  if (nodeOrPath instanceof BaseLayoutNode) {
    const parentPath = nodeOrPath.path.slice(0, -1);
    return isHidden(state, parentPath, forcedVisibleByDevTools, options);
  }
  if (Array.isArray(nodeOrPath) && nodeOrPath.length > 1) {
    const parentPath = nodeOrPath.slice(0, -1);
    return isHidden(state, parentPath, forcedVisibleByDevTools, options);
  }

  return false;
}

export type IsHiddenSelector = ReturnType<typeof Hidden.useIsHiddenSelector>;
export const Hidden = {
  useIsHidden(node: LayoutNode | LayoutPage | undefined, options?: IsHiddenOptions) {
    const forcedVisibleByDevTools = Hidden.useIsForcedVisibleByDevTools();
    return Store.useMemoSelector((s) => isHidden(s, node, forcedVisibleByDevTools, options));
  },
  useIsHiddenPage(pageKey: string, options?: IsHiddenOptions) {
    const forcedVisibleByDevTools = Hidden.useIsForcedVisibleByDevTools();
    return Store.useMemoSelector((s) => isHidden(s, [pageKey], forcedVisibleByDevTools, options));
  },
  useIsHiddenPageSelector() {
    const forcedVisibleByDevTools = Hidden.useIsForcedVisibleByDevTools();
    return Store.useDelayedSelector({
      mode: 'simple',
      selector: (pageKey: string) => (state) => isHidden(state, [pageKey], forcedVisibleByDevTools),
    });
  },
  useHiddenPages(): Set<string> {
    const forcedVisibleByDevTools = Hidden.useIsForcedVisibleByDevTools();
    const hiddenPages = Store.useLaxMemoSelector((s) =>
      Object.keys(s.pagesData.pages).filter((key) => isHidden(s, [key], forcedVisibleByDevTools)),
    );
    return useMemo(() => new Set(hiddenPages === ContextNotProvided ? [] : hiddenPages), [hiddenPages]);
  },
  useIsHiddenSelector() {
    const nodeSelector = useNodeSelector();
    const forcedVisibleByDevTools = Hidden.useIsForcedVisibleByDevTools();
    return Store.useDelayedSelector({
      mode: 'simple',
      selector: (node: NodeRef | LayoutNode | LayoutPage, options?: IsHiddenOptions) => (state) =>
        ignoreNodePathNotFound(
          () => isHidden(state, getNodePath(node, nodeSelector), forcedVisibleByDevTools, options),
          true,
        ),
    });
  },

  /**
   * The next ones are primarily for internal use:
   */
  useIsHiddenViaRules: (node: LayoutNode) =>
    Store.useSelector((s) => s.hiddenViaRules.has(node.getId()) || s.hiddenViaRules.has(node.getBaseId())),
  useIsForcedVisibleByDevTools() {
    const devToolsIsOpen = useDevToolsStore((state) => state.isOpen);
    const devToolsHiddenComponents = useDevToolsStore((state) => state.hiddenComponents);

    return devToolsIsOpen && devToolsHiddenComponents !== 'hide';
  },
  useIsPageHiddenViaTracks(pageKey: string) {
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

function getNodePath(nodeId: NodeRef | LayoutNode | LayoutPage, nodeSelector: NodeSelector) {
  const node = isNodeRef(nodeId) ? nodeSelector(nodeId.nodeRef) : nodeId;

  if (!node) {
    const asString = isNodeRef(nodeId)
      ? nodeId.nodeRef
      : nodeId instanceof BaseLayoutNode
        ? nodeId.getId()
        : nodeId.pageKey;

    throw new Error(`Node not found: ${asString}`);
  }

  return node instanceof LayoutPage ? [node.pageKey] : node.path;
}

export type NodeDataSelector = ReturnType<typeof NodesInternal.useNodeDataSelector>;
export type LaxNodeDataSelector = ReturnType<typeof NodesInternal.useLaxNodeDataSelector>;

export type NodePicker = <N extends LayoutNode | undefined = LayoutNode | undefined>(node: N) => NodePickerReturns<N>;
type NodePickerReturns<N extends LayoutNode | undefined> = N extends undefined ? undefined : NodeDataFromNode<N>;

function selectNodeData<N extends LayoutNode | undefined>(node: N, state: NodesDataContext): NodePickerReturns<N> {
  return ignoreNodePathNotFound(() => (node ? pickDataStorePath(state, node) : undefined), undefined) as any;
}

export const NotReadyYet = Symbol('NotReadyYet');

/**
 * A set of tools, selectors and functions to use internally in node generator components.
 */
export const NodesInternal = {
  /**
   * This is a special selector that will only re-render when the number of nodes that have been added/removed
   * increases AND the selector would return a different result.
   *
   * This is useful for node traversal, which only needs to re-run when a node is added or removed, but don't care about
   * expressions that are solved within. Also, the selectors will always return ContextNotProvided when the nodes
   * are not ready yet.
   */
  useDataSelectorForTraversal(): DSReturn<{
    store: StoreApi<NodesDataContext>;
    strictness: SelectorStrictness.returnWhenNotProvided;
    mode: InnerSelectorMode<NodesDataContext, [NodesDataContext | typeof NotReadyYet]>;
  }> {
    return useDelayedSelector({
      store: Store.useLaxStore(),
      strictness: SelectorStrictness.returnWhenNotProvided,
      onlyReRenderWhen: ((state) => state.ready) satisfies OnlyReRenderWhen<NodesDataContext, void>,
      mode: {
        mode: 'innerSelector',
        makeArgs: (state) => [state.ready ? state : NotReadyYet],
      } satisfies InnerSelectorMode<NodesDataContext, [NodesDataContext | typeof NotReadyYet]>,
    });
  },
  useIsDataReady() {
    return Store.useSelector((s) => s.ready);
  },

  useNodeData<N extends LayoutNode | undefined, Out>(
    node: N,
    selector: (state: NodeDataFromNode<N>) => Out,
  ): N extends undefined ? Out | undefined : Out {
    return Store.useSelector((s) =>
      ignoreNodePathNotFound(
        () => (node ? selector(pickDataStorePath(s, node) as NodeDataFromNode<N>) : undefined),
        undefined,
      ),
    ) as any;
  },
  useNodeDataRef<N extends LayoutNode | undefined, Out>(
    node: N,
    selector: (state: NodeDataFromNode<N>) => Out,
  ): React.MutableRefObject<N extends undefined ? Out | undefined : Out> {
    return Store.useSelectorAsRef((s) =>
      ignoreNodePathNotFound(
        () => (node ? selector(pickDataStorePath(s, node) as NodeDataFromNode<N>) : undefined),
        undefined,
      ),
    ) as any;
  },
  useWaitForNodeData<RetVal, N extends LayoutNode | undefined, Out>(
    node: N,
    selector: (state: NodeDataFromNode<N>) => Out,
  ): WaitForState<Out, RetVal> {
    const waitForState = useWaitForState<RetVal, NodesDataContext>(Store.useStore());
    return useCallback(
      (callback) =>
        waitForState((state, setReturnValue) =>
          ignoreNodePathNotFound(() => {
            if (!state.ready) {
              return false;
            }

            const nodeData = node ? pickDataStorePath(state, node) : undefined;
            if (!nodeData) {
              return false;
            }
            return callback(selector(nodeData as NodeDataFromNode<N>), setReturnValue);
          }, false),
        ),
      [waitForState, node, selector],
    );
  },
  useNodeDataSelector: () =>
    Store.useDelayedSelector({
      mode: 'innerSelector',
      makeArgs: (state) => [((node) => selectNodeData(node, state)) satisfies NodePicker],
    }),
  useLaxNodeDataSelector: () =>
    Store.useLaxDelayedSelector({
      mode: 'innerSelector',
      makeArgs: (state) => [((node) => selectNodeData(node, state)) satisfies NodePicker],
    }),
  useIsAdded: (node: LayoutNode | LayoutPage) =>
    Store.useSelector((s) => {
      if (node instanceof LayoutPage) {
        return s.pagesData.pages[node.pageKey] !== undefined;
      }
      return s.nodeData[node.getId()] !== undefined;
    }),
  useNodesStore: () => Store.useStore(),
  useHasErrors: () => Store.useSelector((s) => s.hasErrors),

  useDataStore: () => Store.useStore(),
  useSetNodeProps: () => Store.useSelector((s) => s.setNodeProps),
  useSetNodes: () => Store.useSelector((s) => s.setNodes),
  useAddPage: () => Store.useSelector((s) => s.addPage),
  useSetPageProp: () => Store.useSelector((s) => s.setPageProp),
  useRemovePage: () => Store.useSelector((s) => s.removePage),
  useAddNodes: () => Store.useSelector((s) => s.addNodes),
  useRemoveNode: () => Store.useSelector((s) => s.removeNode),
  useAddError: () => Store.useSelector((s) => s.addError),

  ...(Object.values(StorePlugins)
    .map((plugin) => plugin.extraHooks(Store))
    .reduce((acc, val) => ({ ...acc, ...val }), {}) as ExtraHooks),
};

/**
 * This hook replaces checkIfConditionalRulesShouldRunSaga(), and fixes a problem that was hard to solve in sagas;
 * namely, that expressions that cause a component to suddenly be visible might also cause other component lookups
 * to start producing a value, so we don't really know how many times we need to run the expressions to reach
 * a stable state. As React hooks are...reactive, we can just run the expressions again when the data changes, and
 * thus continually run the expressions until they stabilize. You _could_ run into an infinite loop if you
 * have a circular dependency in your expressions, but that's a problem with your form, not this hook.
 */
function useLegacyHiddenComponents(setHidden: React.Dispatch<React.SetStateAction<Set<string>>>) {
  const rules = useDynamics()?.conditionalRendering ?? null;
  const nodeTraversal = useNodeTraversalSelectorSilent();
  const formDataSelector = FD.useDebouncedSelector();
  const transposeSelector = useDataModelBindingTranspose();

  useEffect(() => {
    let futureHiddenFields: Set<string>;
    try {
      futureHiddenFields = runConditionalRenderingRules(rules, formDataSelector, nodeTraversal, transposeSelector);
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
  }, [rules, setHidden, nodeTraversal, formDataSelector, transposeSelector]);
}

/**
 * Recursive function to look up a node stored in the page hierarchy. Components may store their children
 * in different ways, so this function has to call out to each component specific implementation to look up
 * children.
 */
export function pickDataStorePath(
  state: NodesDataContext,
  _pathOrNode: string[] | LayoutNode | LayoutPage,
): NodeData | PageData {
  const path =
    _pathOrNode instanceof LayoutPage
      ? [_pathOrNode.pageKey]
      : _pathOrNode instanceof BaseLayoutNode
        ? _pathOrNode.path
        : _pathOrNode;

  if (path.length === 0) {
    throw new Error('Cannot pick root node');
  }

  if (path.length === 1) {
    const page = state.pagesData.pages[path[0]];
    if (!page) {
      throw new NodePathNotFound(`Page not found at path /${path.join('/')}`);
    }
    return page;
  }

  const lastLeg = path[path.length - 1];
  const node = state.nodeData[lastLeg];

  if (!node) {
    throw new NodePathNotFound(`Node not found at path /${path.join('/')}`);
  }

  return node;
}
