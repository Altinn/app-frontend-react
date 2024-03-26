import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { Loader } from 'src/core/loading/Loader';
import { shouldUpdate } from 'src/features/form/dynamics/conditionalRendering';
import { useDynamics } from 'src/features/form/dynamics/DynamicsContext';
import { useHiddenLayoutsExpressions } from 'src/features/form/layout/LayoutsContext';
import { useHiddenPages, useSetHiddenPages } from 'src/features/form/layout/PageNavigationContext';
import { runConditionalRenderingRules } from 'src/utils/conditionalRendering';
import { useExpressionDataSources } from 'src/utils/layout/hierarchy';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { isNodeRef } from 'src/utils/layout/nodeRef';
import { NodesGenerator } from 'src/utils/layout/NodesGenerator';
import type { NodeRef } from 'src/layout';
import type { LayoutNodeFromObj } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

interface NodesContext {
  nodes: LayoutPages | undefined;
  setNodes: (nodes: LayoutPages) => void;

  hiddenViaRules: Set<string>;
  setHiddenViaRules: (mutator: (hidden: Set<string>) => Set<string>) => void;
}

function initialCreateStore() {
  return createStore<NodesContext>((set) => ({
    nodes: undefined,
    setNodes: (nodes: LayoutPages) => set({ nodes }),

    hiddenViaRules: new Set(),
    setHiddenViaRules: (mutator: (currentlyHidden: Set<string>) => Set<string>) =>
      set((state) => ({ hiddenViaRules: mutator(state.hiddenViaRules) })),
  }));
}

const { Provider, useSelector, useMemoSelector, useSelectorAsRef, useLaxSelectorAsRef, useDelayedMemoSelectorFactory } =
  createZustandContext({
    name: 'Nodes',
    required: true,
    initialCreateStore,
  });

export const NodesProvider = (props: React.PropsWithChildren) => (
  <Provider>
    <InnerNodesProvider />
    <InnerHiddenComponentsProvider />
    <BlockUntilLoaded>{props.children}</BlockUntilLoaded>
  </Provider>
);

function InnerNodesProvider() {
  const setNodes = useSelector((state) => state.setNodes);
  return <NodesGenerator setNodes={setNodes} />;
}

function InnerHiddenComponentsProvider() {
  const setHidden = useSelector((state) => state.setHiddenViaRules);
  const resolvedNodes = useSelector((state) => state.nodes);

  useLegacyHiddenComponents(resolvedNodes, setHidden);

  return null;
}

function BlockUntilLoaded({ children }: PropsWithChildren) {
  const hasNodes = useMemoSelector((state) => !!state.nodes);
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
  const node = useSelector((s) => s.nodes?.findById(isNodeRef(idOrRef) ? idOrRef.nodeRef : idOrRef));
  return node as RetValFromNodeRef<T>;
}

export const useNodes = () => useSelector((s) => s.nodes!);
export const useNodesAsRef = () => useSelectorAsRef((s) => s.nodes!);
export const useNodesAsLaxRef = () => useLaxSelectorAsRef((s) => s.nodes!);

export function useNodesMemoSelector<U>(selector: (s: LayoutPages) => U) {
  return useMemoSelector((state) => selector(state.nodes!));
}

export type NodeSelector = ReturnType<typeof useNodeSelector>;
export function useNodeSelector() {
  return useDelayedMemoSelectorFactory({
    selector: (nodeId: string | NodeRef) => (state) =>
      state.nodes?.findById(isNodeRef(nodeId) ? nodeId.nodeRef : nodeId),
    makeCacheKey: (nodeId) => (isNodeRef(nodeId) ? nodeId.nodeRef : nodeId),
  });
}

export type IsHiddenViaRulesSelector = ReturnType<typeof useIsHiddenViaRules>;
export function useIsHiddenViaRules() {
  return useDelayedMemoSelectorFactory({
    selector: (nodeId: string | NodeRef) => (state) =>
      state.hiddenViaRules.has(isNodeRef(nodeId) ? nodeId.nodeRef : nodeId),
    makeCacheKey: (nodeId) => (isNodeRef(nodeId) ? nodeId.nodeRef : nodeId),
  });
}

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
