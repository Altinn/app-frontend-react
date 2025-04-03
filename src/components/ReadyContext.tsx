import React, { useEffect, useMemo, useState } from 'react';
import type { ForwardedRef, PropsWithChildren, PropsWithoutRef } from 'react';

import { v4 as uuid } from 'uuid';
import { createStore } from 'zustand';
import type { StoreApi } from 'zustand';

import { ContextNotProvided } from 'src/core/contexts/context';
import { createZustandContext } from 'src/core/contexts/zustandContext';

type ReadyState = {
  parent: StoreApi<ReadyState> | null;
  id: string;
  ready: boolean;
  children: { [id: string]: boolean };

  setReady: (ready: boolean) => void;
  registerChild: (id: string) => void;
  unRegisterChild: (id: string) => void;
  setChildReady: (id: string, ready: boolean) => void;
};

const { Provider, useStore, useLaxStore } = createZustandContext({
  name: 'ReadyContext',
  required: true,
  initialCreateStore: ({ parent }: { parent: StoreApi<ReadyState> | null }) =>
    createStore<ReadyState>((set) => ({
      parent,
      id: uuid(),
      ready: false,
      children: {},

      setReady: (ready) => set({ ready }),
      registerChild: (id) => set((state) => ({ children: { ...state.children, [id]: false } })),
      unRegisterChild: (id) =>
        set((state) => ({
          children: Object.fromEntries(Object.entries(state.children).filter(([_id]) => _id !== id)),
        })),
      setChildReady: (id, ready) => set((state) => ({ children: { ...state.children, [id]: ready } })),
    })),
});

function InnerReadyProvider({ children }: PropsWithChildren) {
  const store = useStore();

  useEffect(() => {
    const { id, parent } = store.getState();
    if (parent) {
      parent.getState().registerChild(id);
      return () => {
        parent.getState().unRegisterChild(id);
      };
    }
  }, [store]);

  useEffect(() => {
    const { id, parent } = store.getState();
    if (parent) {
      return store.subscribe((state) => {
        const isReady = state.ready && Object.values(state.children).every((ready) => ready);
        const parentState = parent.getState();
        if (parentState.children[id] !== isReady) {
          parentState.setChildReady(id, isReady);
        }
      });
    }
  }, [store]);

  return children;
}

function ReadyProvider({ children }: PropsWithChildren) {
  const parent = useLaxStore();
  return (
    <Provider parent={parent !== ContextNotProvided ? parent : null}>
      <InnerReadyProvider>{children}</InnerReadyProvider>
    </Provider>
  );
}

/**
 * Wrap a component with conditional rendering logic and render the MarkReady component in the branch where the component is ready.
 */
export function withReadyState<P, R>(Component: React.ComponentType<PropsWithoutRef<P> & { MarkReady: React.FC }>) {
  function WrappedComponent({ props, ref }: { props: PropsWithoutRef<P>; ref: ForwardedRef<R> }) {
    const store = useStore();
    const MarkReady = useMemo(() => makeReady(store), [store]);
    return (
      <Component
        {...props}
        ref={ref}
        MarkReady={MarkReady}
      />
    );
  }
  function forwardRef(props: PropsWithoutRef<P>, ref: ForwardedRef<R>) {
    return (
      <ReadyProvider>
        <WrappedComponent
          props={props}
          ref={ref}
        />
      </ReadyProvider>
    );
  }
  const name = Component.displayName || Component.name;
  forwardRef.displayName = `withReadyState(${name})`;

  return React.forwardRef(forwardRef);
}

function makeReady(store: StoreApi<ReadyState>) {
  return function MarkReady() {
    useEffect(() => {
      const state = store.getState();
      if (state.ready === false) {
        state.setReady(true);
      }

      return () => {
        const state = store.getState();
        if (state.ready === true) {
          state.setReady(false);
        }
      };
    }, []);
    return null;
  };
}

export function useAllMarkedReady() {
  const store = useLaxStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (store !== ContextNotProvided) {
      let topStore = store;
      let topState = topStore.getState();
      while (topState.parent !== null) {
        topStore = topState.parent;
        topState = topStore.getState();
      }

      return topStore.subscribe((state) => {
        setIsReady(state.ready && Object.values(state.children).every((ready) => ready));
      });
    }
  }, [store]);

  return store != ContextNotProvided ? isReady : ContextNotProvided;
}
