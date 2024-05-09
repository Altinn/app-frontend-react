import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';

import deepEqual from 'fast-deep-equal';
import { createStore, useStore } from 'zustand';
import type { StoreApi } from 'zustand';

import { ContextNotProvided, createContext } from 'src/core/contexts/context';
import { ShallowArrayMap } from 'src/core/structures/ShallowArrayMap';
import type { CreateContextProps } from 'src/core/contexts/context';

type ExtractFromStoreApi<T> = T extends StoreApi<infer U> ? Exclude<U, void> : never;

const dummyStore = createStore(() => ({}));

type Selector<T, U> = (state: T) => U;
type SelectorFunc<T> = <U>(selector: Selector<T, U>) => U;
type SelectorRefFunc<T> = <U>(selector: Selector<T, U>) => { current: U };
type SelectorRefFuncLax<T> = <U>(selector: Selector<T, U>) => { current: U | typeof ContextNotProvided };
type SelectorFuncLax<T> = <U>(selector: Selector<T, U>) => U | typeof ContextNotProvided;

type AnyFunc = (...args: any[]) => any;
type DelayedSelectorFunc<T> = <U>(selector: Selector<T, U>, cacheKey: any[]) => U;
type DelayedSelectorMap<T> = ShallowArrayMap<{ selector: Selector<T, any>; value: any }>;
type DelayedSecondarySelector<Arg, RetVal, T> = [Arg] extends [AnyFunc]
  ? <U>(innerSelector: Selector<T, U>, deps: any[]) => U
  : (arg: Arg) => RetVal;
type DelayedPrimarySelector<Arg, RetVal, T> = (arg: Arg) => Selector<T, RetVal>;

export function createZustandContext<Store extends StoreApi<Type>, Type = ExtractFromStoreApi<Store>, Props = any>(
  props: CreateContextProps<Store> & {
    initialCreateStore: (props: Props) => Store;
    onReRender?: (store: Store, props: Props) => void;
  },
) {
  const { initialCreateStore, onReRender, ...rest } = props;
  const { Provider, useCtx, useLaxCtx, useHasProvider } = createContext<Store>(rest);

  /**
   * A hook that can be used to select values from the store. The selector function will be called whenever the store
   * changes, and the component will re-render if the selected value changes when compared with the previous value.
   */
  const useSelector: SelectorFunc<Type> = (selector) => useStore(useCtx(), selector);

  const useSelectorAsRef: SelectorRefFunc<Type> = (selector) => {
    const store = useCtx();
    const ref = useRef<any>(selector(store.getState()));

    useEffect(
      () =>
        store.subscribe((state) => {
          ref.current = selector(state);
        }),
      // The selector is not expected to change, so we don't need to include it in the dependency array.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [store],
    );

    return ref;
  };

  const useLaxSelectorAsRef: SelectorRefFuncLax<Type> = (selector) => {
    const store = useLaxCtx();
    const ref = useRef<any>(store === ContextNotProvided ? ContextNotProvided : selector(store.getState() as Type));

    useEffect(() => {
      if (store === ContextNotProvided) {
        ref.current = ContextNotProvided;
        return;
      }
      return store.subscribe((state) => {
        ref.current = selector(state);
      });
    }, [store, selector]);

    return ref;
  };

  /**
   * Same as useSelector, but can be used to select complex values, such as objects or arrays, and will only trigger
   * a re-render if the selected value changes when compared with the previous value. Values are compared using
   * 'fast-deep-equal'.
   */
  const useMemoSelector: SelectorFunc<Type> = (selector) => {
    const prev = useRef<any>(undefined);
    return useSelector((state) => {
      const next = selector(state);
      if (deepEqual(next, prev.current)) {
        return prev.current;
      }
      prev.current = next;
      return next;
    });
  };

  const useLaxMemoSelector: SelectorFuncLax<Type> = (selector) => {
    const _store = useLaxCtx();
    const store = _store === ContextNotProvided ? dummyStore : _store;
    const prev = useRef<any>(undefined);
    return useStore(store as any, (state: Type) => {
      if (_store === ContextNotProvided) {
        return ContextNotProvided;
      }

      const next = selector(state);
      if (deepEqual(next, prev.current)) {
        return prev.current;
      }
      prev.current = next;
      return next;
    });
  };

  /**
   * A complex hook that returns a function you can use to select a value at some point in the future. If you never
   * select any values from the store, the store will not be subscribed to, and the component will not re-render when
   * the store changes. If you do select a value, the store will be subscribed to, and the component will only re-render
   * if the selected value(s) change when compared with the previous value.
   *
   * An important note when using this hook: The selector functions you pass must also be memoized (i.e. created with
   * useMemo or useCallback), or the component will fall back to re-rendering every time the store changes. This is
   * because the function itself will be recreated every time the component re-renders, and the function
   * will not be able to be used as a cache key.
   */
  const useDelayedMemoSelectorProto = (store: Store | typeof ContextNotProvided): DelayedSelectorFunc<Type> => {
    const selectorsCalled = useRef<DelayedSelectorMap<Type>>(new ShallowArrayMap());
    const [renderCount, forceRerender] = useState(0);

    useEffect(() => {
      if (store === ContextNotProvided) {
        return;
      }

      return store.subscribe((state) => {
        // When the state changes, we run all the known selectors again to figure out if anything changed. If it
        // did change, we'll clear the list of selectors to force a re-render.
        const selectors = selectorsCalled.current.values();
        let changed = false;
        for (const { selector, value } of selectors) {
          if (!deepEqual(value, selector(state))) {
            changed = true;
            break;
          }
        }
        if (changed) {
          selectorsCalled.current = new ShallowArrayMap();
          forceRerender((prev) => prev + 1);
        }
      });
    }, [store]);

    return useCallback(
      (selector, cacheKey) => {
        if (store === ContextNotProvided) {
          return undefined;
        }
        if (isNaN(renderCount)) {
          // This should not happen, and this piece of code looks a bit out of place. This really is only here
          // to make sure the callback is re-created and the component re-renders when the store changes.
          throw new Error('useDelayedMemoSelector: renderCount is NaN');
        }

        // Check if this function has been called before. If it has, with the same arguments, we can return the
        // cached value instead of the new one.
        const prev = selectorsCalled.current.get(cacheKey);
        if (prev) {
          return prev.value;
        }

        const state = store.getState();
        const value = selector(state);

        // The value has changed, or the callback is new to us. No need to re-render the component now, because
        // this is always the first render where this value is referenced, and we're always selecting from fresh state.
        selectorsCalled.current.set(cacheKey, { selector, value });
        return value;
      },
      [store, renderCount],
    );
  };

  const useLaxDelayedMemoSelectorFactory = <Arg, RetVal>(
    primarySelector: DelayedPrimarySelector<Arg, RetVal, Type>,
    deps: any[] = [],
  ) => {
    const _store = useLaxCtx();
    const _delayedSelector = useDelayedMemoSelectorProto(_store);
    const delayedSelector = _store === ContextNotProvided ? ContextNotProvided : _delayedSelector;
    const callbacks = useRef<Map<any, Selector<Type, RetVal>>>(new Map());

    useEffect(() => {
      callbacks.current = new Map();
    }, [delayedSelector]);

    const callback = useCallback(
      (...args: any[]) => {
        if (delayedSelector === ContextNotProvided) {
          return ContextNotProvided as RetVal;
        }

        const cacheKey = makeCacheKey(args);
        if (!callbacks.current.has(cacheKey)) {
          callbacks.current.set(cacheKey, primarySelector(args[0]));
        }
        return delayedSelector(callbacks.current.get(cacheKey)!, cacheKey) as RetVal;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [delayedSelector, ...deps],
    ) as DelayedSecondarySelector<Arg, RetVal, Type>;

    return delayedSelector === ContextNotProvided ? ContextNotProvided : callback;
  };

  // The non-lax version is the exact same, but we mangle the return type to remove ContextNotProvided
  const useDelayedMemoSelectorFactory = useLaxDelayedMemoSelectorFactory as <Arg, RetVal>(
    primarySelector: DelayedPrimarySelector<Arg, RetVal, Type>,
    deps?: any[],
  ) => DelayedSecondarySelector<Arg, RetVal, Type>;

  /**
   * A hook much like useSelector(), but will also work if the context provider is not present. If the context provider
   * is not present, the hook will return the ContextNotProvided value instead.
   */
  const useLaxSelector: SelectorFuncLax<Type> = (_selector) => {
    const _store = useLaxCtx();
    const store = _store === ContextNotProvided ? dummyStore : _store;
    const selector = _store === ContextNotProvided ? () => ContextNotProvided : _selector;
    return useStore(store as any, selector as any);
  };

  function MyProvider({ children, ...props }: PropsWithChildren<Props>) {
    const storeRef = useRef<Store>();
    if (!storeRef.current) {
      storeRef.current = initialCreateStore(props as Props);
    }

    useEffect(() => {
      if (onReRender && storeRef.current) {
        onReRender(storeRef.current, props as Props);
      }
    });

    return <Provider value={storeRef.current}>{children}</Provider>;
  }

  function makeCacheKey(args: any[]): any[] {
    if (typeof args[0] === 'function') {
      return [args[0].toString().trim(), ...args[1]];
    }

    return args;
  }

  return {
    Provider: MyProvider,
    useSelector,
    useSelectorAsRef,
    useLaxSelectorAsRef,
    useMemoSelector,
    useLaxMemoSelector,
    useLaxSelector,
    useDelayedMemoSelectorFactory,
    useLaxDelayedMemoSelectorFactory,
    useHasProvider,
    useStore: useCtx,
    useLaxStore: useLaxCtx,
  };
}
