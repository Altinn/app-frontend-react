import React, { useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject, PropsWithChildren } from 'react';

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
import { HiddenComponentsProvider } from 'src/features/form/dynamics/HiddenComponentsProvider';
import { useLayoutLookups, useLayouts } from 'src/features/form/layout/LayoutsContext';
import { ExpressionValidation } from 'src/features/validation/expressionValidation/ExpressionValidation';
import {
  LoadingBlockerWaitForValidation,
  ProvideWaitForValidation,
  Validation,
} from 'src/features/validation/validationContext';
import { ValidationStorePlugin } from 'src/features/validation/ValidationStorePlugin';
import { getComponentDef } from 'src/layout';
import { useComponentIdMutator } from 'src/utils/layout/DataModelLocation';
import { generatorLog } from 'src/utils/layout/generator/debug';
import { GeneratorGlobalProvider } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorData } from 'src/utils/layout/generator/GeneratorDataSources';
import { GeneratorStagesEffects, useRegistry } from 'src/utils/layout/generator/GeneratorStages';
import { LayoutSetGenerator } from 'src/utils/layout/generator/LayoutSetGenerator';
import { GeneratorValidationProvider } from 'src/utils/layout/generator/validation/GenerationValidationContext';
import type { AttachmentsStorePluginConfig } from 'src/features/attachments/AttachmentsStorePlugin';
import type { LayoutLookups } from 'src/features/form/layout/makeLayoutLookups';
import type { ValidationsProcessedLast } from 'src/features/validation';
import type { ValidationStorePluginConfig } from 'src/features/validation/ValidationStorePlugin';
import type { ObjectOrArray } from 'src/hooks/useShallowMemo';
import type { CompTypes, ILayouts } from 'src/layout/layout';
import type { Registry } from 'src/utils/layout/generator/GeneratorStages';
import type { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { GeneratorErrors, NodeData } from 'src/utils/layout/types';

export interface PagesData {
  type: 'pages';
  pages: {
    [key: string]: PageData;
  };
}

export interface PageData {
  type: 'page';
  pageKey: string;
  hidden: boolean;
  inOrder: boolean;
  errors: GeneratorErrors | undefined;
}

export type NodesStorePlugins = {
  validation: ValidationStorePluginConfig;
  attachments: AttachmentsStorePluginConfig;
};

const StorePlugins: { [K in keyof NodesStorePlugins]: NodeDataPlugin<NodesStorePlugins[K]> } = {
  validation: new ValidationStorePlugin(),
  attachments: new AttachmentsStorePlugin(),
};

type AllFlat<T> = UnionToIntersection<T extends Record<string, infer U> ? (U extends undefined ? never : U) : never>;
type ExtraFunctions = AllFlat<{
  [K in keyof NodesStorePlugins]: NodesStorePlugins[K]['extraFunctions'];
}>;
type ExtraHooks = AllFlat<{
  [K in keyof NodesStorePlugins]: NodesStorePlugins[K]['extraHooks'];
}>;

export interface AddNodeRequest<T extends CompTypes = CompTypes> {
  nodeId: string;
  targetState: NodeData<T>;
}

export interface RemoveNodeRequest {
  nodeId: string;
  layouts: ILayouts;
}

export interface SetNodePropRequest<T extends CompTypes, K extends keyof NodeData<T>> {
  nodeId: string;
  prop: K;
  value: NodeData<T>[K];
}

export type NodesContext = {
  hasErrors: boolean;
  pagesData: PagesData;
  nodeData: { [key: string]: NodeData };
  hiddenViaRules: { [key: string]: true | undefined };
  hiddenViaRulesRan: boolean;

  layouts: ILayouts | undefined; // Used to detect if the layouts have changed

  addNodes: (requests: AddNodeRequest[]) => void;
  removeNodes: (request: RemoveNodeRequest[]) => void;
  setNodeProps: (requests: SetNodePropRequest<CompTypes, keyof NodeData>[]) => void;
  addError: (error: string, id: string, type: 'node' | 'page') => void;
  markHiddenViaRule: (hiddenFields: { [nodeId: string]: true }) => void;

  addPage: (pageKey: string) => void;

  reset: (layouts: ILayouts, validationsProcessedLast: ValidationsProcessedLast) => void;

  waitForCommits: undefined | (() => Promise<void>);
  setWaitForCommits: (waitForCommits: () => Promise<void>) => void;
} & NodesProviderProps &
  ExtraFunctions;

/**
 * Using the inferred types in the immer produce() function here introduces a lot of typescript overhead, which slows
 * down development. Using this instead short-circuits the type-checking to make it fast again.
 */
export function nodesProduce(fn: (draft: NodesContext) => void) {
  return produce(fn) as unknown as Partial<NodesContext>;
}

interface CreateStoreProps extends NodesProviderProps {
  validationsProcessedLast: ValidationsProcessedLast;
}

export type NodesContextStore = StoreApi<NodesContext>;
export function createNodesDataStore({ validationsProcessedLast, ...props }: CreateStoreProps) {
  const defaultState = {
    hasErrors: false,
    pagesData: {
      type: 'pages' as const,
      pages: {},
    },
    nodeData: {},
    hiddenViaRules: {},
    hiddenViaRulesRan: false,
    validationsProcessedLast,
  };

  return createStore<NodesContext>((set) => ({
    ...defaultState,
    ...props,

    layouts: undefined,

    markHiddenViaRule: (newState) =>
      set((state) => {
        if (deepEqual(state.hiddenViaRules, newState)) {
          return { hiddenViaRulesRan: true };
        }

        return { hiddenViaRules: newState, hiddenViaRulesRan: true };
      }),

    addNodes: (requests) =>
      set((state) => {
        const nodeData = { ...state.nodeData };
        for (const { nodeId, targetState } of requests) {
          nodeData[nodeId] = targetState;
        }

        return { nodeData };
      }),
    removeNodes: (requests) =>
      set((state) => {
        const nodeData = { ...state.nodeData };

        let count = 0;
        for (const { nodeId, layouts } of requests) {
          if (!nodeData[nodeId]) {
            continue;
          }

          if (layouts !== state.layouts) {
            // The layouts have changed since the request was added, so there's no need to remove the node (it was
            // automatically removed when resetting the NodesContext state upon the layout change)
            continue;
          }

          delete nodeData[nodeId];
          count += 1;
        }

        if (count === 0) {
          return {};
        }

        return { nodeData };
      }),
    setNodeProps: (requests) =>
      set((state) => {
        let changes = false;
        const nodeData = { ...state.nodeData };
        for (const { nodeId, prop, value } of requests) {
          if (!nodeData[nodeId]) {
            continue;
          }

          const thisNode = { ...nodeData[nodeId] };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          thisNode[prop as any] = value;

          if (!deepEqual(nodeData[nodeId][prop], thisNode[prop])) {
            changes = true;
            nodeData[nodeId] = thisNode;
          }
        }
        return changes ? { nodeData } : {};
      }),
    addError: (error, id, type) =>
      set(
        nodesProduce((state) => {
          const data = type === 'page' ? state.pagesData.pages[id] : state.nodeData[id];
          if (!data) {
            return;
          }
          if (!data.errors) {
            data.errors = {};
          }
          data.errors[error] = true;

          state.hasErrors = true;
        }),
      ),
    addPage: (pageKey) =>
      set(
        nodesProduce((state) => {
          if (state.pagesData.pages[pageKey]) {
            return;
          }

          state.pagesData.pages[pageKey] = {
            type: 'page',
            pageKey,
            hidden: false,
            inOrder: true,
            errors: undefined,
          };
        }),
      ),

    reset: (layouts, validationsProcessedLast: ValidationsProcessedLast) =>
      set(() => {
        generatorLog('logStages', 'Resetting state');
        return { ...structuredClone(defaultState), layouts, validationsProcessedLast };
      }),

    waitForCommits: undefined,
    setWaitForCommits: (waitForCommits) => set(() => ({ waitForCommits })),

    ...(Object.values(StorePlugins)
      .map((plugin) => plugin.extraFunctions(set))
      .reduce((acc, val) => ({ ...acc, ...val }), {}) as ExtraFunctions),
  }));
}

const Store = createZustandContext<NodesContextStore, NodesContext>({
  name: 'Nodes',
  required: true,
  initialCreateStore: createNodesDataStore,
});

export const NodesStore = Store; // Should be considered internal, do not use unless you know what you're doing
export type NodesStoreFull = typeof Store;

/**
 * Another set of hooks for internal use that will work different ways depending on the render context. If you use
 * these selectors inside GeneratorStages (aka. inside the node generation process), they will re-run every time the
 * store changes, even if the store is not ready. Thus you have to make due with partially generated data. However,
 * if you use these selectors outside of the generation stages, they will only re-run when the store is ready.
 */
const Conditionally = {
  useSelector: <T,>(selector: (state: NodesContext) => T): T | undefined => Store.useSelector(selector),
  useMemoSelector: <T,>(selector: (state: NodesContext) => T): T | undefined => Store.useMemoSelector(selector),
  useLaxSelector: <T,>(selector: (state: NodesContext) => T): T | typeof ContextNotProvided =>
    Store.useLaxSelector(selector),
  useLaxMemoSelector: <T,>(selector: (state: NodesContext) => T): T | typeof ContextNotProvided =>
    Store.useLaxMemoSelector(selector),
};

interface NodesProviderProps extends PropsWithChildren {
  readOnly: boolean;
  isEmbedded: boolean;
}

export const NodesProvider = ({ children, ...props }: NodesProviderProps) => {
  const registry = useRegistry();
  const getProcessedLast = Validation.useGetProcessedLast();

  return (
    <Store.Provider
      {...props}
      validationsProcessedLast={getProcessedLast()}
    >
      <ProvideGlobalContext registry={registry}>
        <GeneratorStagesEffects />
        <GeneratorValidationProvider>
          <GeneratorData.Provider>
            <LayoutSetGenerator />
          </GeneratorData.Provider>
        </GeneratorValidationProvider>
        {window.Cypress && <UpdateAttachmentsForCypress />}
        <HiddenComponentsProvider />
        <BlockUntilRulesRan>
          <ProvideWaitForValidation />
          <ExpressionValidation />
          <LoadingBlockerWaitForValidation>{children}</LoadingBlockerWaitForValidation>
        </BlockUntilRulesRan>
      </ProvideGlobalContext>
    </Store.Provider>
  );
};

function ProvideGlobalContext({ children, registry }: PropsWithChildren<{ registry: MutableRefObject<Registry> }>) {
  const latestLayouts = useLayouts();
  const layouts = Store.useSelector((s) => s.layouts);
  const reset = Store.useSelector((s) => s.reset);
  const getProcessedLast = Validation.useGetProcessedLast();

  useEffect(() => {
    if (layouts !== latestLayouts) {
      reset(latestLayouts, getProcessedLast());
    }
  }, [latestLayouts, layouts, reset, getProcessedLast]);

  if (layouts !== latestLayouts) {
    // You changed the layouts, possibly by using devtools. Hold on while we re-generate!
    return <NodesLoader />;
  }

  return (
    <GeneratorGlobalProvider
      layouts={layouts}
      registry={registry}
    >
      {children}
    </GeneratorGlobalProvider>
  );
}

function BlockUntilRulesRan({ children }: PropsWithChildren) {
  const hasBeenReady = useRef(false);
  const ready = Store.useSelector((state) => {
    if (state.hiddenViaRulesRan) {
      hasBeenReady.current = true;
      return true;
    }
    return hasBeenReady.current;
  });

  if (!ready) {
    return <NodesLoader />;
  }

  return children;
}

function NodesLoader() {
  return <Loader reason='nodes' />;
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

  /**
   * Default = false. Set this to true to force all hidden components to be visible (used by our DevTools).
   */
  forcedVisibleByDevTools?: boolean;
}

type AccessibleIsHiddenOptions = Omit<IsHiddenOptions, 'forcedVisibleByDevTools'>;

function withDefaults(options?: IsHiddenOptions): Required<IsHiddenOptions> {
  const { respectDevTools = true, respectTracks = false, forcedVisibleByDevTools = false } = options ?? {};
  return { respectDevTools, respectTracks, forcedVisibleByDevTools };
}

function isHiddenPage(state: NodesContext, pageKey: string | undefined, _options?: IsHiddenOptions) {
  const options = withDefaults(_options);
  if (!pageKey) {
    return true;
  }

  if (options.forcedVisibleByDevTools && options.respectDevTools) {
    return false;
  }

  const pageState = state.pagesData.pages[pageKey];
  const hidden = pageState?.hidden;
  if (hidden) {
    return true;
  }

  return options.respectTracks ? pageState?.inOrder === false : false;
}

export function isHidden(
  state: NodesContext,
  type: 'page' | 'node',
  id: string | undefined,
  lookups: LayoutLookups,
  _options?: IsHiddenOptions,
): boolean | undefined {
  if (!id) {
    return undefined;
  }

  if (type === 'page') {
    return isHiddenPage(state, id, _options);
  }

  const options = withDefaults(_options);
  if (options.forcedVisibleByDevTools && options.respectDevTools) {
    return false;
  }

  const pageKey = state.nodeData[id]?.pageKey;
  if (pageKey && isHiddenPage(state, pageKey, _options)) {
    return true;
  }

  const hidden = JSON.parse('false'); // TODO: Rewrite all of this
  // const hidden = state.nodeData[id]?.hidden;
  if (hidden === undefined || hidden === true) {
    return hidden;
  }

  if (state.hiddenViaRules[id]) {
    return true;
  }

  const parentId = state.nodeData[id]?.parentId;
  const parent = parentId ? state.nodeData[parentId] : undefined;
  const parentDef = parent ? getComponentDef(parent.nodeType) : undefined;
  if (parent && parentDef && 'isChildHidden' in parentDef) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childHidden = parentDef.isChildHidden(parent as any, id, lookups);
    if (childHidden) {
      return true;
    }
  }

  if (parent) {
    return isHidden(state, 'node', parent.id, lookups, options);
  }

  return false;
}

function makeOptions(forcedVisibleByDevTools: boolean, options?: AccessibleIsHiddenOptions): IsHiddenOptions {
  return {
    ...options,
    forcedVisibleByDevTools,
  };
}

function useIsForcedVisibleByDevTools() {
  return useDevToolsStore((state) => state.isOpen && state.hiddenComponents !== 'hide');
}

export type IsHiddenSelector = ReturnType<typeof Hidden.useIsHiddenSelector>;
export const Hidden = {
  useIsHidden(nodeId: string | undefined, type: 'page' | 'node' | undefined, options?: AccessibleIsHiddenOptions) {
    const lookups = useLayoutLookups();
    const forcedVisibleByDevTools = useIsForcedVisibleByDevTools();
    if (typeof nodeId === 'string' && type === undefined) {
      throw new Error(
        'useIsHidden() requires a node ID/page ID and a type. When id is given, type has to be given too.',
      );
    }

    return Store.useSelector((s) => isHidden(s, type!, nodeId, lookups, makeOptions(forcedVisibleByDevTools, options)));
  },
  useIsHiddenPage(pageKey: string | undefined, options?: AccessibleIsHiddenOptions) {
    const forcedVisibleByDevTools = useIsForcedVisibleByDevTools();
    return Store.useSelector((s) => isHiddenPage(s, pageKey, makeOptions(forcedVisibleByDevTools, options)));
  },
  useIsHiddenPageSelector() {
    const forcedVisibleByDevTools = useIsForcedVisibleByDevTools();
    return Store.useDelayedSelector(
      {
        mode: 'simple',
        selector: (pageKey: string) => (state) => isHiddenPage(state, pageKey, makeOptions(forcedVisibleByDevTools)),
      },
      [forcedVisibleByDevTools],
    );
  },
  useHiddenPages(): Set<string> {
    const forcedVisibleByDevTools = useIsForcedVisibleByDevTools();
    const hiddenPages = Store.useLaxMemoSelector((s) =>
      Object.keys(s.pagesData.pages).filter((key) => isHiddenPage(s, key, makeOptions(forcedVisibleByDevTools))),
    );
    return useMemo(() => new Set(hiddenPages === ContextNotProvided ? [] : hiddenPages), [hiddenPages]);
  },
  useIsHiddenSelector() {
    const forcedVisibleByDevTools = useIsForcedVisibleByDevTools();
    const lookups = useLayoutLookups();
    return Store.useDelayedSelector(
      {
        mode: 'simple',
        selector: (nodeId: string, type: 'node' | 'page', options?: IsHiddenOptions) => (state) =>
          isHidden(state, type, nodeId, lookups, makeOptions(forcedVisibleByDevTools, options)),
      },
      [forcedVisibleByDevTools],
    );
  },
  useIsHiddenSelectorProps() {
    const forcedVisibleByDevTools = useIsForcedVisibleByDevTools();
    const lookups = useLayoutLookups();
    return Store.useDelayedSelectorProps(
      {
        mode: 'simple',
        selector: (nodeId: string, type: 'node' | 'page', options?: IsHiddenOptions) => (state) =>
          isHidden(state, type, nodeId, lookups, makeOptions(forcedVisibleByDevTools, options)),
      },
      [forcedVisibleByDevTools],
    );
  },

  /**
   * Iterate through a list of node IDs and find the first one that is not hidden
   */
  useFirstVisibleBaseId(baseIds: string[]) {
    const lookups = useLayoutLookups();
    const idMutator = useComponentIdMutator();
    return Store.useSelector((state) => {
      for (const baseId of baseIds) {
        const id = idMutator(baseId);
        if (!isHidden(state, 'node', id, lookups)) {
          return baseId;
        }
      }
      return undefined;
    });
  },
};

export type NodeDataSelector = ReturnType<typeof NodesInternal.useNodeDataSelector>;

export type NodeIdPicker = <T extends CompTypes = CompTypes>(
  id: string | undefined,
  type: T | undefined,
) => NodeData<T> | undefined;

function selectNodeData<T extends CompTypes = CompTypes>(
  id: string | undefined,
  type: T | undefined,
  state: NodesContext,
): NodeData<T> | undefined {
  if (!id) {
    return undefined;
  }

  const data = state.nodeData[id];
  if (data && type && data.nodeType !== type) {
    return undefined;
  }

  return data as NodeData<T>;
}

/**
 * A set of tools, selectors and functions to use internally in node generator components.
 */
export const NodesInternal = {
  useIsReadOnly() {
    return Store.useSelector((s) => s.readOnly);
  },
  useIsEmbedded() {
    return Store.useSelector((s) => s.isEmbedded);
  },
  useFullErrorList() {
    return Store.useMemoSelector((s) => {
      const errors: { [pageOrNode: string]: string[] } = {};

      for (const pageKey in s.pagesData.pages) {
        const page = s.pagesData.pages[pageKey];
        if (page.errors) {
          errors[`page/${pageKey}`] = Object.keys(page.errors);
        }
      }

      for (const nodeId in s.nodeData) {
        const node = s.nodeData[nodeId];
        if (node.errors) {
          errors[`node/${nodeId}`] = Object.keys(node.errors);
        }
      }

      return errors;
    });
  },

  useNodeErrors(nodeId: string | undefined) {
    return Store.useSelector((s) => {
      if (!nodeId) {
        return undefined;
      }
      return s.nodeData[nodeId]?.errors;
    });
  },
  useNodeData<Id extends string | undefined, Type extends CompTypes, Out>(
    nodeId: Id,
    type: Type | undefined,
    selector: (nodeData: NodeData<Type>) => Out,
  ) {
    return Conditionally.useMemoSelector((s) => {
      if (!nodeId) {
        return undefined;
      }

      const data = s.nodeData[nodeId];
      if (data && type && data.nodeType !== type) {
        throw new Error(`Expected id ${nodeId} to be of type ${type}, but it is of type ${data.nodeType}`);
      }

      return data ? selector(data as NodeData<Type>) : undefined;
    }) as Id extends undefined ? Out | undefined : Out;
  },
  useNodeDataSelector: () =>
    Store.useDelayedSelector({
      mode: 'innerSelector',
      makeArgs: (state) => [((id, type = undefined) => selectNodeData(id, type, state)) satisfies NodeIdPicker],
    }),
  useNodeDataSelectorProps: () =>
    Store.useDelayedSelectorProps({
      mode: 'innerSelector',
      makeArgs: (state) => [((id, type = undefined) => selectNodeData(id, type, state)) satisfies NodeIdPicker],
    }),
  useIsAdded: (id: string | undefined, type: 'node' | 'page' | undefined) =>
    Store.useSelector((s) => {
      if (!id) {
        return false;
      }
      if (type === undefined) {
        throw new Error('useIsAdded() requires an id and a type. When id is given, type has to be given too.');
      }
      if (type === 'page') {
        return s.pagesData.pages[id] !== undefined;
      }
      return s.nodeData[id] !== undefined;
    }),
  useHasErrors: () => Store.useSelector((s) => s.hasErrors),

  // Raw selectors, used when there are no other hooks that match your needs
  useSelector: <T,>(selector: (state: NodesContext) => T) => Store.useSelector(selector),
  useShallowSelector: <T extends ObjectOrArray>(selector: (state: NodesContext) => T) =>
    Store.useShallowSelector(selector),
  useMemoSelector: <T,>(selector: (state: NodesContext) => T) => Store.useMemoSelector(selector),
  useLaxMemoSelector: <T,>(selector: (state: NodesContext) => T) => Store.useLaxMemoSelector(selector),

  useStore: () => Store.useStore(),
  useSetNodeProps: () => Store.useStaticSelector((s) => s.setNodeProps),
  useAddPage: () => Store.useStaticSelector((s) => s.addPage),
  useAddNodes: () => Store.useStaticSelector((s) => s.addNodes),
  useRemoveNodes: () => Store.useStaticSelector((s) => s.removeNodes),
  useAddError: () => Store.useStaticSelector((s) => s.addError),
  useMarkHiddenViaRule: () => Store.useStaticSelector((s) => s.markHiddenViaRule),
  useSetWaitForCommits: () => Store.useStaticSelector((s) => s.setWaitForCommits),

  ...(Object.values(StorePlugins)
    .map((plugin) => plugin.extraHooks(Store))
    .reduce((acc, val) => ({ ...acc, ...val }), {}) as ExtraHooks),
};
