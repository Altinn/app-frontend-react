import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { MutableRefObject } from 'react';

import deepEqual from 'fast-deep-equal';
import type { StoreApi } from 'zustand';

import { ContextNotProvided } from 'src/core/contexts/context';
import { ShallowArrayMap } from 'src/core/structures/ShallowArrayMap';

type Selector<T, U> = (state: T) => U;
type SelectorMap<C extends DSConfig> = ShallowArrayMap<{
  fullSelector: Selector<TypeFromConf<C>, unknown>;
  value: unknown;
}>;

type TypeFromConf<C extends DSConfig> = C extends DSConfig<infer T> ? T : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModeFromConf<C extends DSConfig> = C extends DSConfig<any, infer M> ? M : never;

type Internal<C extends DSConfig> = {
  selectorsCalled: SelectorMap<C> | null;
  lastReRenderValue: unknown | null;
  unsubscribe: (() => void) | null;
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
export function useDelayedSelector<C extends DSConfig>({
  store,
  deps = [],
  strictness,
  mode,
  makeCacheKey = mode.mode === 'simple' ? defaultMakeCacheKey : defaultMakeCacheKeyForInnerSelector,
  equalityFn = deepEqual,
  onlyReRenderWhen,
}: DSProps<C>): DSReturn<C> {
  const [renderCount, forceRerender] = useState(0);
  const internal = useRef<Internal<C>>({
    selectorsCalled: null,
    lastReRenderValue: null,
    unsubscribe: null,
  });

  useEffect(() => () => internal.current.unsubscribe?.(), []);

  const subscribe = useCallback(
    () =>
      store !== ContextNotProvided
        ? store.subscribe((state) => {
            const s = internal.current;
            if (!s.selectorsCalled) {
              return;
            }

            let stateChanged = true;
            if (onlyReRenderWhen) {
              stateChanged = onlyReRenderWhen(state, s.lastReRenderValue, (v) => {
                s.lastReRenderValue = v;
              });
            }
            if (!stateChanged) {
              return;
            }

            // When the state changes, we run all the known selectors again to figure out if anything changed. If it
            // did change, we'll clear the list of selectors to force a re-render.
            const selectors = s.selectorsCalled.values();
            let changed = false;
            for (const { fullSelector, value } of selectors) {
              if (!equalityFn(value, fullSelector(state))) {
                changed = true;
                break;
              }
            }
            if (changed) {
              s.selectorsCalled = null;
              forceRerender((prev) => prev + 1);
            }
          })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store],
  );

  return useCallback(
    (...args: unknown[]) => {
      if (store === ContextNotProvided) {
        if (strictness === SelectorStrictness.throwWhenNotProvided) {
          throw new Error('useDelayedSelector: store not provided');
        }
        return ContextNotProvided;
      }
      const s = internal.current;

      if (isNaN(renderCount)) {
        // This should not happen, and this piece of code looks a bit out of place. This really is only here
        // to make sure the callback is re-created and the component re-renders when the store changes.
        throw new Error('useDelayedSelector: renderCount is NaN');
      }

      const cacheKey = makeCacheKey(args);
      const prev = s.selectorsCalled?.get(cacheKey);
      if (prev) {
        // Performance-wise we could also just have called the selector here, it doesn't really matter. What is
        // important however, is that we let developers know as early as possible if they forgot to include a dependency
        // or otherwise used the hook incorrectly, so we'll make sure to return the value to them here even if it
        // could be stale (but only when improperly used).
        return prev.value;
      }

      // We don't need to initialize the arraymap before checking for the previous value,
      // since we know it would not exist if we just created it.
      if (!s.selectorsCalled) {
        s.selectorsCalled = new ShallowArrayMap();
      }
      if (!s.unsubscribe) {
        s.unsubscribe = subscribe();
      }

      const state = store.getState();

      if (mode.mode === 'simple') {
        const { selector } = mode as SimpleArgMode;
        const fullSelector: Selector<TypeFromConf<C>, unknown> = (state) => selector(...args)(state);
        const value = fullSelector(state);
        s.selectorsCalled.set(cacheKey, { fullSelector, value });
        return value;
      }

      if (mode.mode === 'innerSelector') {
        const { makeArgs } = mode as InnerSelectorMode;
        if (typeof args[0] !== 'function' || !Array.isArray(args[1]) || args.length !== 2) {
          throw new Error('useDelayedSelector: innerSelector must be a function');
        }
        const fullSelector: Selector<TypeFromConf<C>, unknown> = (state) => {
          const innerArgs = makeArgs(state);
          const innerSelector = args[0] as (...args: typeof innerArgs) => unknown;
          return innerSelector(...innerArgs);
        };

        const value = fullSelector(state);
        s.selectorsCalled.set(cacheKey, { fullSelector, value });
        return value;
      }

      throw new Error('useDelayedSelector: invalid mode');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, renderCount, ...deps],
  ) as DSReturn<C>;
}

class DelayedSelectorProto<C extends DSConfig> {
  private name: string | undefined;
  private store: C['store'];
  private strictness: C['strictness'];
  private mode: C['mode'];
  private makeCacheKey: (args: unknown[]) => unknown[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private equalityFn: (a: any, b: any) => boolean;
  private onlyReRenderWhen: OnlyReRenderWhen<TypeFromConf<C>, unknown> | undefined;
  private deps: unknown[] | undefined;

  private lastReRenderValue: unknown = null;
  private selectorsCalled: SelectorMap<C> | null = null;
  private unsubscribeMethod: (() => void) | null = null;

  private changeCount = 0;
  private lastSelectChangeCount = 0;

  private onChange: (lastSelectChangeCount: number, name?: string) => void;

  constructor(
    {
      store,
      strictness,
      mode,
      makeCacheKey = mode.mode === 'simple' ? defaultMakeCacheKey : defaultMakeCacheKeyForInnerSelector,
      equalityFn = deepEqual,
      onlyReRenderWhen,
      deps,
    }: DSProps<C>,
    onChange: (lastSelectChangeCount: number, name?: string) => void,
    name?: string,
  ) {
    this.name = name;
    this.store = store;
    this.strictness = strictness;
    this.mode = mode;
    this.makeCacheKey = makeCacheKey;
    this.equalityFn = equalityFn;
    this.onlyReRenderWhen = onlyReRenderWhen;
    this.deps = deps;
    this.onChange = onChange;
  }

  public unsubscribe() {
    if (this.unsubscribeMethod) {
      this.unsubscribeMethod();
      this.unsubscribeMethod = null;
    }
  }

  public getSelector() {
    return ((...args: unknown[]) => this.selector(...args)) as DSReturn<C>;
  }

  public setChangeCount(i: number) {
    this.changeCount = i;
  }

  public checkDeps(newProps: DSProps<C>) {
    if (newProps.deps && !arrayShallowEqual(newProps.deps, this.deps)) {
      const {
        store,
        strictness,
        mode,
        makeCacheKey = mode.mode === 'simple' ? defaultMakeCacheKey : defaultMakeCacheKeyForInnerSelector,
        equalityFn = deepEqual,
        onlyReRenderWhen,
        deps,
      } = newProps;

      this.store = store;
      this.strictness = strictness;
      this.mode = mode;
      this.makeCacheKey = makeCacheKey;
      this.equalityFn = equalityFn;
      this.onlyReRenderWhen = onlyReRenderWhen;
      this.deps = deps;

      this.selectorsCalled = null;
      this.unsubscribe();
      this.onChange(this.lastSelectChangeCount);
    }
  }

  private subscribe() {
    if (this.store === ContextNotProvided) {
      return null;
    }
    return this.store.subscribe((state) => {
      if (!this.selectorsCalled) {
        return;
      }

      let stateChanged = true;
      if (this.onlyReRenderWhen) {
        stateChanged = this.onlyReRenderWhen(state, this.lastReRenderValue, (v) => {
          this.lastReRenderValue = v;
        });
      }
      if (!stateChanged) {
        return;
      }

      // When the state changes, we run all the known selectors again to figure out if anything changed. If it
      // did change, we'll clear the list of selectors to force a re-render.
      const selectors = this.selectorsCalled.values();
      let changed = false;
      for (const { fullSelector, value } of selectors) {
        if (!this.equalityFn(value, fullSelector(state))) {
          changed = true;
          break;
        }
      }
      if (changed) {
        this.selectorsCalled = null;
        this.unsubscribe();
        this.onChange(this.lastSelectChangeCount, this.name);
      }
    });
  }

  public selector(...args: unknown[]) {
    if (this.store === ContextNotProvided) {
      if (this.strictness === SelectorStrictness.throwWhenNotProvided) {
        throw new Error('useDelayedSelector: store not provided');
      }
      return ContextNotProvided;
    }

    this.lastSelectChangeCount = this.changeCount;

    const cacheKey = this.makeCacheKey(args);
    const prev = this.selectorsCalled?.get(cacheKey);
    if (prev) {
      // Performance-wise we could also just have called the selector here, it doesn't really matter. What is
      // important however, is that we let developers know as early as possible if they forgot to include a dependency
      // or otherwise used the hook incorrectly, so we'll make sure to return the value to them here even if it
      // could be stale (but only when improperly used).
      return prev.value;
    }

    // We don't need to initialize the arraymap before checking for the previous value,
    // since we know it would not exist if we just created it.
    if (!this.selectorsCalled) {
      this.selectorsCalled = new ShallowArrayMap();
    }
    if (!this.unsubscribeMethod) {
      this.unsubscribeMethod = this.subscribe();
    }

    const state = this.store.getState();

    if (this.mode.mode === 'simple') {
      const { selector } = this.mode as SimpleArgMode;
      const fullSelector: Selector<TypeFromConf<C>, unknown> = (state) => selector(...args)(state);
      const value = fullSelector(state);
      this.selectorsCalled.set(cacheKey, { fullSelector, value });
      return value;
    }

    if (this.mode.mode === 'innerSelector') {
      const { makeArgs } = this.mode as InnerSelectorMode;
      if (typeof args[0] !== 'function' || !Array.isArray(args[1]) || args.length !== 2) {
        throw new Error('useDelayedSelector: innerSelector must be a function');
      }
      const fullSelector: Selector<TypeFromConf<C>, unknown> = (state) => {
        const innerArgs = makeArgs(state);
        const innerSelector = args[0] as (...args: typeof innerArgs) => unknown;
        return innerSelector(...innerArgs);
      };

      const value = fullSelector(state);
      this.selectorsCalled.set(cacheKey, { fullSelector, value });
      return value;
    }

    throw new Error('useDelayedSelector: invalid mode');
  }
}

type MDSProps = {
  [name: string]: DSProps<DSConfig>;
};

type MDSSTate<P extends MDSProps> = {
  changeCount: number;
  delayedSelectors: { [name in keyof P]?: DelayedSelectorProto<P[name]> };
  snapshot: { [name in keyof P]: DSReturn<P[name]> };
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => { [name in keyof P]: DSReturn<P[name]> };
  forceRerender: () => void;
  hasDeps: (keyof P)[];
};

function initMultiSelectorState<P extends MDSProps>(props: P, state: MutableRefObject<MDSSTate<P>>): MDSSTate<P> {
  const subscribe = (callback: () => void) => {
    state.current.forceRerender = callback;
    return () => Object.values(state.current.delayedSelectors).forEach((ds) => ds?.unsubscribe());
  };

  const getSnapshot = () => state.current.snapshot;

  const onChange = (lastSelectRenderCount: number, name?: string) => {
    // Prevent multiple re-renders at the same time
    state.current.snapshot[name as keyof P] = state.current.delayedSelectors[name as keyof P]!.getSelector();
    if (lastSelectRenderCount === state.current.changeCount) {
      state.current.snapshot = { ...state.current.snapshot };
      state.current.forceRerender();
    }
    state.current.changeCount += 1;
    Object.values(state.current.delayedSelectors).forEach((ds) => ds.setChangeCount(state.current.changeCount));
  };

  // const [delayedSelectors, snapshot, hasDeps] = makeDelayedSelectors(props, onChange);

  const initialSnapshot = {};
  const hasDeps: (keyof P)[] = [];
  for (const name in props) {
    const prop = props[name];
    !!prop.deps && hasDeps.push(name);
    initialSnapshot[name as string] = (...args: unknown[]) => {
      let delayedSelector = state.current.delayedSelectors[name];
      if (!delayedSelector) {
        delayedSelector = new DelayedSelectorProto(prop, onChange, name) as DelayedSelectorProto<P[typeof name]>;
        state.current.delayedSelectors[name] = delayedSelector;
      }
      return delayedSelector.selector(...args);
    };
  }

  return {
    changeCount: 0,
    delayedSelectors: {},
    snapshot: initialSnapshot as { [name in keyof P]: DSReturn<P[name]> },
    subscribe,
    getSnapshot,
    forceRerender: () => {},
    hasDeps,
  };
}

export function useMultipleDelayedSelectors<P extends MDSProps>(props: P) {
  const state: MutableRefObject<MDSSTate<P>> = useRef(
    initMultiSelectorState(props, {
      get current() {
        return state.current;
      },
    }),
  );

  // Check if any deps have changed
  if (state.current.hasDeps.length) {
    for (const name of state.current.hasDeps) {
      state.current.delayedSelectors[name]?.checkDeps(props[name] as never);
    }
  }

  return useSyncExternalStore(state.current.subscribe, state.current.getSnapshot) as {
    [name in keyof P]: DSReturn<P[name]>;
  };
}

type DSSTate<C extends DSConfig> = {
  delayedSelector?: DelayedSelectorProto<C>;
  snapshot: DSReturn<C>;
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => DSReturn<C>;
  forceRerender: () => void;
  hasDeps: boolean;
};

function initSelectorState<C extends DSConfig>(props: DSProps<C>, state: MutableRefObject<DSSTate<C>>): DSSTate<C> {
  const subscribe = (callback: () => void) => {
    state.current.forceRerender = callback;
    return () => state.current.delayedSelector?.unsubscribe();
  };

  const getSnapshot = () => state.current.snapshot;

  const onChange = () => {
    state.current.snapshot = state.current.delayedSelector!.getSelector();
    state.current.forceRerender();
  };

  const initialSnapshot = (...args: unknown[]) => {
    let delayedSelector = state.current.delayedSelector;
    if (!delayedSelector) {
      delayedSelector = new DelayedSelectorProto(props, onChange);
      state.current.delayedSelector = delayedSelector;
    }
    return delayedSelector.selector(...args);
  };

  const hasDeps = !!props.deps;

  return {
    snapshot: initialSnapshot as DSReturn<C>,
    subscribe,
    getSnapshot,
    forceRerender: () => {},
    hasDeps,
  };
}

export function useDelayedSelector2<C extends DSConfig>(props: DSProps<C>): DSReturn<C> {
  const state: MutableRefObject<DSSTate<C>> = useRef(
    initSelectorState(props, {
      get current() {
        return state.current;
      },
    }),
  );

  // Check if any deps have changed
  if (state.current.hasDeps) {
    state.current.delayedSelector?.checkDeps(props);
  }

  return useSyncExternalStore(state.current.subscribe, state.current.getSnapshot);
}

// function makeDelayedSelectors<P extends MDSProps>(props: P, onChange: (lastSelectRenderCount: number) => void) {
//   const delayedSelectors = {};
//   const selectors = {};
//   const hasDeps: (keyof P)[] = [];
//   for (const name in props) {
//     const prop = props[name];
//     !!prop.deps && hasDeps.push(name);
//     const ds = new DelayedSelectorProto(prop, onChange, name);
//     delayedSelectors[name as string] = ds;
//     selectors[name as string] = ds.getSelector();
//   }
//   return [delayedSelectors, selectors, hasDeps] as [
//     MDSSTate<P>['delayedSelectors'],
//     MDSSTate<P>['snapshot'],
//     (keyof P)[],
//   ];
// }
//
// function getFreshSelectors<P extends MDSProps>(delayedSelectors: {
//   [name in keyof P]?: DelayedSelectorProto<P[name]>;
// }) {
//   const selectors = {};
//   for (const name in delayedSelectors) {
//     selectors[name as string] = delayedSelectors[name]?.getSelector();
//   }
//   return selectors as MDSSTate<P>['snapshot'];
// }

function arrayShallowEqual(a: unknown[], b?: unknown[]) {
  if (a.length !== b?.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function defaultMakeCacheKeyForInnerSelector(args: unknown[]): unknown[] {
  if (args.length === 2 && typeof args[0] === 'function' && Array.isArray(args[1])) {
    return [args[0].toString().trim(), ...args[1]];
  }

  throw new Error('defaultMakeCacheKeyForInnerSelector: invalid arguments, use simple mode instead');
}

function defaultMakeCacheKey(args: unknown[]): unknown[] {
  // Make sure we don't allow inner selectors here, they need to use another mode:
  if (args.length === 2 && typeof args[0] === 'function' && Array.isArray(args[1])) {
    throw new Error('defaultMakeCacheKey: inner selectors are not allowed, use innerSelector mode instead');
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SimpleArgMode<T = unknown, Args extends any[] = unknown[], RetVal = unknown> {
  mode: 'simple';
  selector: (...args: Args) => (state: T) => RetVal;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface InnerSelectorMode<T = unknown, Args extends any[] = unknown[]> {
  mode: 'innerSelector';
  makeArgs: (state: T) => Args;
}

export type DSMode<T> = SimpleArgMode<T> | InnerSelectorMode<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DSConfig<Type = any, Mode extends DSMode<Type> = any, Strictness extends SelectorStrictness = any> {
  store: StoreApi<Type> | typeof ContextNotProvided;
  mode: Mode;
  strictness: Strictness;
}

export interface DSProps<C extends DSConfig> {
  // A delayed selector must work with a Zustand store, or with ContextNotProvided if the store is not provided.
  store: C['store'];

  // Strictness changes how the delayed selector will work when ContextNotProvided is passed as the store.
  strictness: C['strictness'];

  // State selected from the delayed selector will be compared with this function. The default is deepEqual, meaning
  // that the state will be compared by value, not by reference.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  equalityFn?: (a: any, b: any) => boolean;

  // A function that will create a cache key for the delayed selector. This is used to cache the results of the
  // selector functions. Every argument to the selector function will be passed to this function.
  makeCacheKey?: (args: unknown[]) => unknown[];

  // Optionally, you can pass a function that will determine if the selector functions should re-run. If this function
  // returns false, an update to the store will not cause a re-render of the component.
  onlyReRenderWhen?: OnlyReRenderWhen<TypeFromConf<C>, unknown>;

  mode: C['mode'];

  // Any dependencies that should be passed to the delayed selector. This is used to determine when the entire
  // selector should be re-created.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps?: any[];
}

export type DSReturn<C extends DSConfig> =
  ModeFromConf<C> extends SimpleArgMode
    ? (...args: Parameters<C['mode']['selector']>) => ReturnType<ReturnType<C['mode']['selector']>>
    : <U>(
        innerSelector: (...args: ReturnType<C['mode']['makeArgs']>) => U,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        deps: any[],
      ) => C['strictness'] extends SelectorStrictness.returnWhenNotProvided ? U | typeof ContextNotProvided : U;
