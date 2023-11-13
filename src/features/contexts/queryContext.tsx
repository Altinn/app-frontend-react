import React from 'react';
import type { PropsWithChildren } from 'react';

import type { UseQueryResult } from '@tanstack/react-query';

import { createLaxContext, createStrictContext } from 'src/features/contexts/createContext';
import { DisplayError } from 'src/features/errorHandling/DisplayError';
import { Loader } from 'src/features/loading/Loader';
import type { StrictContextProps } from 'src/features/contexts/createContext';

interface StrictQueryContextProps<T> extends StrictContextProps {
  useQuery: () => UseQueryResult<T>;
}

interface GenericProviderProps<T, Prop> extends PropsWithChildren {
  name: string;
  prop?: Prop;
  useQuery: (prop?: Prop) => UseQueryResult<T>;
  RealProvider: React.Provider<T>;
  required: boolean;
}

function GenericProvider<T, P>({ children, useQuery, RealProvider, name, required, prop }: GenericProviderProps<T, P>) {
  const { data, isLoading, error } = useQuery(prop);

  if (required && (!data || isLoading)) {
    return <Loader reason={`query-${name}`} />;
  }

  if (error) {
    return <DisplayError error={error as Error} />;
  }

  return <RealProvider value={data as T}>{children}</RealProvider>;
}

export function createStrictQueryContext<T>({ name, useQuery }: StrictQueryContextProps<T>) {
  const { Provider, useCtx } = createStrictContext<T>({ name });

  const ThisProvider = ({ children }: PropsWithChildren) => (
    <GenericProvider
      name={name}
      useQuery={useQuery}
      RealProvider={Provider}
      required={true}
    >
      {children}
    </GenericProvider>
  );

  return {
    Provider: ThisProvider,
    useCtx,
  };
}

interface LaxQueryContextProps<T> {
  name: string;
  initialState?: T;
  useIsEnabled: () => boolean;
  useQuery: (enabled: boolean) => UseQueryResult<T | undefined>;
}

export function createLaxQueryContext<T>({ name, useQuery, useIsEnabled, initialState }: LaxQueryContextProps<T>) {
  const { Provider, useCtx, useHasProvider } = createLaxContext<T>(initialState);

  const ThisProvider = ({ children }: PropsWithChildren) => {
    const enabled = useIsEnabled();

    return (
      <GenericProvider
        name={name}
        prop={enabled}
        useQuery={useQuery}
        RealProvider={Provider}
        required={enabled}
      >
        {children}
      </GenericProvider>
    );
  };

  return {
    Provider: ThisProvider,
    useCtx,
    useHasProvider,
  };
}
