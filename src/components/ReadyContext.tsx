import React, { useEffect, useMemo } from 'react';
import type { ForwardedRef, PropsWithChildren, PropsWithoutRef } from 'react';

import { v4 as uuid } from 'uuid';
import { createStore } from 'zustand';

import { ContextNotProvided } from 'src/core/contexts/context';
import { createZustandContext } from 'src/core/contexts/zustandContext';

type ReadyState = {
  rootReady: boolean;
  children: { [id: string]: boolean };

  setRootReady: (ready: boolean) => void;
  registerChild: (id: string) => void;
  unRegisterChild: (id: string) => void;
  setChildReady: (id: string, ready: boolean) => void;
};

const { Provider, useLaxStaticSelector, useStaticSelector, useLaxSelector } = createZustandContext({
  name: 'ReadyContext',
  required: true,
  initialCreateStore: () =>
    createStore<ReadyState>((set) => ({
      rootReady: false,
      children: {},

      setRootReady: (ready) => set({ rootReady: ready }),
      registerChild: (id) => set((state) => ({ children: { ...state.children, [id]: false } })),
      unRegisterChild: (id) =>
        set((state) => ({
          children: Object.fromEntries(Object.entries(state.children).filter(([_id]) => _id !== id)),
        })),
      setChildReady: (id, ready) => set((state) => ({ children: { ...state.children, [id]: ready } })),
    })),
});

export function RootReadyProvider({ children }: PropsWithChildren) {
  return <Provider>{children}</Provider>;
}

export function MarkRootReady() {
  const setRootReady = useStaticSelector((state) => state.setRootReady);
  useEffect(() => {
    setRootReady(true);
    return () => {
      setRootReady(false);
    };
  }, [setRootReady]);

  return null;
}

/**
 * Wrap a component with conditional rendering logic (or blocking providers) and render the MarkReady component in the branch where the component is ready.
 */
export function withReadyState<P, R>(Component: React.ComponentType<PropsWithoutRef<P> & { MarkReady: React.FC }>) {
  function WrappedComponent(props: PropsWithoutRef<P>, ref: ForwardedRef<R>) {
    const selectors = useLaxStaticSelector((state) => ({
      registerChild: state.registerChild,
      unRegisterChild: state.unRegisterChild,
      setChildReady: state.setChildReady,
    }));

    const { id, MarkReady } = useMemo(() => {
      const id = uuid();
      const MarkReady = makeMarkReady(id, selectors);
      return { id, MarkReady };
    }, [selectors]);

    // Register this component so we wait until it renders its MarkReady
    useEffect(() => {
      if (selectors !== ContextNotProvided) {
        selectors.registerChild(id);
        return () => {
          selectors.unRegisterChild(id);
        };
      }
    }, [id, selectors]);

    return (
      <Component
        {...props}
        ref={ref}
        MarkReady={MarkReady}
      />
    );
  }
  const name = Component.displayName || Component.name;
  WrappedComponent.displayName = `withReadyState(${name})`;

  return React.forwardRef(WrappedComponent);
}

function makeMarkReady(
  id: string,
  selectors: { setChildReady: ReadyState['setChildReady'] } | typeof ContextNotProvided,
) {
  return function MarkReady() {
    useEffect(() => {
      if (selectors !== ContextNotProvided) {
        selectors.setChildReady(id, true);
        return () => {
          selectors.setChildReady(id, false);
        };
      }
    }, []);

    return null;
  };
}

export const useReadyState = () =>
  useLaxSelector((state) => state.rootReady && Object.values(state.children).every((ready) => ready));
