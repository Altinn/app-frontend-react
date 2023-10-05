import React from 'react';

type ContextProvider<T> = {
  Provider: React.Provider<T>;
  useCtx: () => T;
};

type CreateStrictContextProps = {
  options: {
    errorMessage?: string;
    name?: string;
  };
};

/**
 * A strict context must always be provided, and will throw an error if it is not. This is useful for contexts that
 * are required for the application to function.
 */
export const createStrictContext = <T>(props?: CreateStrictContextProps): ContextProvider<T> => {
  const Context = React.createContext<T | undefined>(undefined);

  const useCtx = (): T => {
    const context = React.useContext(Context);
    if (context === undefined) {
      throw new Error(props?.options.errorMessage || `${props?.options.name || ''} Context Provider is missing`);
    }
    return context;
  };

  return { Provider: Context.Provider as React.Provider<T>, useCtx };
};

/**
 * Non-strict contexts can be used without a provider, and will return undefined if no provider is found.
 * This is just a wrapper around the React.createContext function, and provides a slightly nicer API.
 */
export const createLaxContext = <T>(initialState?: T): ContextProvider<T | undefined> => {
  const Context = React.createContext<T | undefined>(initialState);
  const useCtx = () => React.useContext(Context);

  return { Provider: Context.Provider, useCtx };
};
