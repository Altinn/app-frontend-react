import React from 'react';
import type { PropsWithChildren } from 'react';

import { ContextNotProvided, createContext } from 'src/core/contexts/context';
import type { CompInternal, CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

type ChildMutator<T extends CompTypes = CompTypes> = (item: CompInternal<T>) => void;

interface ProviderProps {
  parent: LayoutNode | LayoutPage;
  hidden: boolean | undefined;
  directMutators?: ChildMutator[];
  recursiveMutators?: ChildMutator[];
}

interface NodesGeneratorContext extends ProviderProps {
  depth: number; // Depth is 1 for top level nodes, 2 for children of top level nodes, etc.
}

const { Provider, useCtx, useLaxCtx } = createContext<NodesGeneratorContext>({
  name: 'NodesGenerator',
  required: true,
});

/**
 * This provider will use upper contexts to set the hidden and depth values, as well as inherit recursive
 * mutators from the parent. This way we can have a single recursive mutator that is applied to all children, no
 * matter how many levels of context providers we have.
 */
export function NodesGeneratorProvider({ children, ...rest }: PropsWithChildren<ProviderProps>) {
  const _parent = useLaxCtx();
  const parent = _parent === ContextNotProvided ? undefined : _parent;
  const value: NodesGeneratorContext = {
    ...parent,
    ...rest,

    // Direct mutators are not meant to be inherited, if none are passed to us directly we'll use an empty array.
    directMutators: rest.directMutators ?? [],

    // If the parent is hidden, we are also hidden. The default is false, and every component inside a hidden one
    // will be marked as hidden as well.
    hidden: rest.hidden ? true : parent?.hidden ?? false,

    // The first place this is provided is the page, so the depth is 1 for top level nodes.
    depth: (parent?.depth ?? 0) + 1,
  };

  return <Provider value={value}>{children}</Provider>;
}

export const NodeGeneratorInternal = {
  useDirectMutators: () => useCtx().directMutators ?? [],
  useRecursiveMutators: () => useCtx().recursiveMutators ?? [],
  useIsHiddenByParent: () => useCtx().hidden ?? false,
  useDepth: () => useCtx().depth,
};
