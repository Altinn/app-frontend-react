import React from 'react';

import { createContext as createReactContext, useContextSelector } from 'use-context-selector';

interface ContextProvider<T> {
  Provider: React.Provider<T>;
  useCtx: () => T;
  useCtxSelector: <U>(selector: (value: T) => U) => U;
  useHasProvider: () => boolean;
}

interface BaseProps {
  // The name of the context. This is used for error messages and loading indicators.
  name: string;
  required: boolean;
}

export interface StrictContextProps extends BaseProps {
  // If the context is required, it will throw an error if no provider is found. You can also use the useHasProvider
  // hook to check if a provider is present.
  required: true;
}

export interface LaxContextProps<T> extends BaseProps {
  // If the context is not required, it will return undefined if no provider is found. If you need to check if a
  // provider is present, (but the data is undefined) you can use the useHasProvider hook.
  required: false;

  // The default state of the context. This is only relevant for (re)lax(ed) contexts. Even if there is no provider,
  // the default state will be returned. This makes it possible to have strictly typed contexts that are not required,
  // but will always return a default value.
  default: T;
}

export type CreateContextProps<T> = StrictContextProps | LaxContextProps<T>;

/**
 * A strict context must always be provided, and will throw an error if it is not. This is useful for contexts that
 * are required for the application to function.
 */
export function createContext<T>({ name, required, ...rest }: CreateContextProps<T>): ContextProvider<T> {
  const defaultValue = 'default' in rest ? rest.default : undefined;
  const Context = createReactContext<{ innerValue: T | undefined; provided: boolean }>({
    innerValue: defaultValue,
    provided: false,
  });
  Context.displayName = name;

  const useHasProvider = () => Boolean(useContextSelector(Context, (v) => v.provided));

  const useCtx = (): T => {
    const hasProvider = useHasProvider();
    const value = useContextSelector(Context, (v) => v.innerValue);
    if (!hasProvider) {
      if (required) {
        throw new Error(`${name} is missing`);
      }
      return defaultValue as T;
    }
    return value as T;
  };

  function useCtxSelector<U>(selector: (value: T) => U): U {
    const hasProvider = useHasProvider();
    const value = useContextSelector(Context, (v) => (hasProvider ? selector(v.innerValue as T) : undefined));
    if (!hasProvider) {
      if (required) {
        throw new Error(`${name} is missing`);
      }
      return selector(defaultValue as T);
    }
    return value as U;
  }

  const Provider = ({ value, children }: Parameters<React.Provider<T | undefined>>[0]) => (
    <Context.Provider value={{ innerValue: value, provided: true }}>{children}</Context.Provider>
  );

  return {
    Provider: React.memo(Provider as React.Provider<T>),
    useCtx,
    useCtxSelector,
    useHasProvider,
  };
}
