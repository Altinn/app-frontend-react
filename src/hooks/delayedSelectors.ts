import { useCallback, useEffect, useRef, useState } from 'react';

import deepEqual from 'fast-deep-equal';
import type { StoreApi } from 'zustand';

import { ContextNotProvided } from 'src/core/contexts/context';
import { ShallowArrayMap } from 'src/core/structures/ShallowArrayMap';

type ExtractFromStoreApi<T> = T extends StoreApi<infer U> ? Exclude<U, void> : never;

type Selector<T, U> = (state: T) => U;
type AnyFunc = (...args: any[]) => any;
type DelayedSelectorFunc<T> = <U>(selector: Selector<T, U>, cacheKey: any[]) => U;
type DelayedSelectorMap<T> = ShallowArrayMap<{ selector: Selector<T, any>; value: any }>;
export type DelayedSecondarySelector<Arg, RetVal, T> = [Arg] extends [AnyFunc]
  ? DelayedSecondaryFunc<T>
  : (arg: Arg) => RetVal;
export type DelayedSecondaryFunc<T> = <U>(innerSelector: Selector<T, U>, deps: any[]) => U;
export type DelayedPrimarySelector<Arg, RetVal, T> = (arg: Arg) => Selector<T, RetVal>;

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
function useDelayedSelectorProto<Store extends StoreApi<any>, Type = ExtractFromStoreApi<Store>>(
  store: Store | typeof ContextNotProvided,
  {
    equalityFn = deepEqual,
    onlyReRenderWhen,
  }: Pick<DelayedSelectorFactoryProps<any, any, Type, any>, 'equalityFn' | 'onlyReRenderWhen'>,
): DelayedSelectorFunc<Type> {
  const selectorsCalled = useRef<DelayedSelectorMap<Type>>(new ShallowArrayMap());
  const [renderCount, forceRerender] = useState(0);
  const lastReRenderValue = useRef<unknown>(undefined);

  useEffect(
    () => {
      if (store === ContextNotProvided) {
        return;
      }

      return store.subscribe((state) => {
        let stateChanged = true;
        if (onlyReRenderWhen) {
          stateChanged = onlyReRenderWhen(state, lastReRenderValue.current, (v) => {
            lastReRenderValue.current = v;
          });
        }
        if (!stateChanged) {
          return;
        }

        // When the state changes, we run all the known selectors again to figure out if anything changed. If it
        // did change, we'll clear the list of selectors to force a re-render.
        const selectors = selectorsCalled.current.values();
        let changed = false;
        for (const { selector, value } of selectors) {
          if (!equalityFn(value, selector(state))) {
            changed = true;
            break;
          }
        }
        if (changed) {
          selectorsCalled.current = new ShallowArrayMap();
          forceRerender((prev) => prev + 1);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store],
  );

  return useCallback(
    (selector, cacheKey) => {
      if (store === ContextNotProvided) {
        return undefined;
      }
      if (isNaN(renderCount)) {
        // This should not happen, and this piece of code looks a bit out of place. This really is only here
        // to make sure the callback is re-created and the component re-renders when the store changes.
        throw new Error('useDelayedSelector: renderCount is NaN');
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
}

function defaultMakeCacheKey(args: unknown[]): unknown[] {
  if (args.length === 2 && typeof args[0] === 'function' && Array.isArray(args[1])) {
    return [args[0].toString().trim(), ...args[1]];
  }

  return args;
}

export enum SelectorStrictness {
  throwWhenNotProvided = 'throwWhenNotProvided',
  returnWhenNotProvided = 'returnWhenNotProvided',
}

export type OnlyReRenderWhen<Type, Internal> = (
  state: Type,
  lastValue: Internal | undefined,
  setNewValue: (v: Internal) => void,
) => boolean;

export interface DelayedSelectorFactoryProps<Arg, RetVal, Type, Strictness extends SelectorStrictness> {
  // A delayed selector must work with a Zustand store, or with ContextNotProvided if the store is not provided.
  store: StoreApi<Type> | typeof ContextNotProvided;

  // Strictness changes how the delayed selector will work when ContextNotProvided is passed as the store.
  strictness: Strictness;

  // State selected from the delayed selector will be compared with this function. The default is deepEqual, meaning
  // that the state will be compared by value, not by reference.
  equalityFn?: (a: any, b: any) => boolean;

  // A function that will create a cache key for the delayed selector. This is used to cache the results of the
  // selector functions. Every argument to the selector function will be passed to this function.
  makeCacheKey?: (args: unknown[]) => unknown[];

  // Optionally, you can pass a function that will determine if the selector functions should re-run. If this function
  // returns false, an update to the store will not cause a re-render of the component.
  onlyReRenderWhen?: OnlyReRenderWhen<Type, unknown>;

  // The primary selector is the function that will be called with the arguments passed to the delayed selector.
  primarySelector: DelayedPrimarySelector<Arg, RetVal, Type>;

  // Any dependencies that should be passed to the delayed selector. This is used to determine when the primary
  // selector should be re-created.
  deps?: any[];
}

/**
 * The factory function for creating a delayed selector. This will be the hook you'll actually use, but it is expected
 * you package this some way - or use the ones exported from zustandContext.tsx.
 */
export function useDelayedSelectorFactory<Arg, RetVal, Type, Strictness extends SelectorStrictness>({
  store,
  strictness,
  makeCacheKey = defaultMakeCacheKey,
  primarySelector,
  deps = [],
  ...rest
}: DelayedSelectorFactoryProps<Arg, RetVal, Type, Strictness>) {
  const _delayedSelector = useDelayedSelectorProto(store, rest);
  const delayedSelector = store === ContextNotProvided ? ContextNotProvided : _delayedSelector;

  // TODO: Do we need two sets of callback refs?
  const callbacks = useRef(new ShallowArrayMap<Selector<Type, RetVal>>());

  useEffect(() => {
    callbacks.current = new ShallowArrayMap();
  }, [delayedSelector]);

  return useCallback(
    (...args: any[]) => {
      if (delayedSelector === ContextNotProvided && strictness === SelectorStrictness.throwWhenNotProvided) {
        throw new Error('useDelayedSelector: store not provided');
      }
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
  ) as Strictness extends SelectorStrictness.throwWhenNotProvided
    ? DelayedSecondarySelector<Arg, RetVal, Type>
    : DelayedSecondarySelector<Arg, RetVal | typeof ContextNotProvided, Type>;
}
