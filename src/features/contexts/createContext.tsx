import React from 'react';

interface ContextProvider<T> {
  Provider: React.Provider<T>;
  useCtx: () => T;
}

interface LaxContextProvider<T> extends ContextProvider<T | undefined> {
  useHasProvider: () => boolean;
}

export interface StrictContextProps {
  name: string;
}

/**
 * A strict context must always be provided, and will throw an error if it is not. This is useful for contexts that
 * are required for the application to function.
 */
export function createStrictContext<T>(props: StrictContextProps): ContextProvider<T> {
  const { Provider, useHasProvider, useCtx: useLaxCtx } = createLaxContext<T>(undefined);

  const useCtx = (): T => {
    const hasProvider = useHasProvider();
    const value = useLaxCtx();
    if (!hasProvider) {
      throw new Error(`${props.name} is missing`);
    }
    return value as T;
  };

  return { Provider: Provider as React.Provider<T>, useCtx };
}

/**
 * Non-strict contexts can be used without a provider, and will return undefined if no provider is found.
 * If your data is optional, this is the context you want to use.
 *
 * Sometimes you may want to check if a provider is present, even though the set data is undefined. This is useful
 * for contexts that are not required for the whole application to function, but are required for certain features.
 * You can use the useHasProvider hook to check if a provider is present.
 *
 * This is just a wrapper around the React.createContext function, and provides a slightly nicer API.
 */
export function createLaxContext<T>(initialState?: T): LaxContextProvider<T | undefined> {
  const Context = React.createContext<{ innerValue: T | undefined; provided: boolean }>({
    innerValue: initialState,
    provided: false,
  });
  const useCtx = () => React.useContext(Context).innerValue;
  const useHasProvider = () => Boolean(React.useContext(Context).provided);

  const Provider = ({ value, children }: Parameters<React.Provider<T | undefined>>[0]) => (
    <Context.Provider value={{ innerValue: value, provided: true }}>{children}</Context.Provider>
  );

  return {
    Provider: Provider as React.Provider<T | undefined>,
    useCtx,
    useHasProvider,
  };
}
