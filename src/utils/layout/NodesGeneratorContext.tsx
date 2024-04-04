import React from 'react';
import type { PropsWithChildren } from 'react';

import { ContextNotProvided, createContext } from 'src/core/contexts/context';
import type { CompInternal, CompTypes } from 'src/layout/layout';

type ChildMutator<T extends CompTypes = CompTypes> = (item: CompInternal<T>) => void;

interface ProviderProps {
  hidden?: boolean;
  directMutators?: ChildMutator[];
  recursiveMutators?: ChildMutator[];
}

interface NodesGeneratorContext extends ProviderProps {
  depth: number; // Starts at 1 (for top level nodes)
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
