import React from 'react';
import type { PropsWithChildren } from 'react';

import type { UseQueryResult } from '@tanstack/react-query';

import { createLaxContext, createStrictContext } from 'src/core/contexts/context';
import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import type { StrictContextProps } from 'src/core/contexts/context';

export interface StrictQueryContextProps<T> extends StrictContextProps {
  useQuery: () => UseQueryResult<T>;
}

interface GenericProviderProps<T> extends PropsWithChildren {
  name: string;
  useQuery: () => UseQueryResult<T> & { enabled: boolean };
  RealProvider: React.Provider<T>;
}

function GenericProvider<T>({ children, useQuery, RealProvider, name }: GenericProviderProps<T>) {
  const { data, isLoading, error, enabled } = useQuery();

  if (enabled && isLoading) {
    return <Loader reason={`query-${name}`} />;
  }

  if (error) {
    return <DisplayError error={error as Error} />;
  }

  return <RealProvider value={data as T}>{children}</RealProvider>;
}

/**
 * Always call this through a delayedContext() call to prevent problems with cyclic imports
 * @see delayedContext
 */
export function createStrictQueryContext<T>({ name, useQuery }: StrictQueryContextProps<T>) {
  const { Provider, useCtx } = createStrictContext<T>({ name });

  const ThisProvider = ({ children }: PropsWithChildren) => (
    <GenericProvider
      name={name}
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useQuery={() => ({ ...useQuery(), enabled: true })}
      RealProvider={Provider}
    >
      {children}
    </GenericProvider>
  );

  return {
    Provider: ThisProvider,
    useCtx,
  };
}

export interface LaxQueryContextProps<T> {
  name: string;
  initialState?: T;
  useQuery: () => UseQueryResult<T | undefined> & { enabled: boolean };
}

/**
 * Always call this through a delayedContext() call to prevent problems with cyclic imports
 * @see delayedContext
 */
export function createLaxQueryContext<T>({ name, useQuery, initialState }: LaxQueryContextProps<T>) {
  const { Provider, useCtx, useHasProvider } = createLaxContext<T>(initialState);

  const ThisProvider = ({ children }: PropsWithChildren) => (
    <GenericProvider
      name={name}
      useQuery={useQuery}
      RealProvider={Provider}
    >
      {children}
    </GenericProvider>
  );

  return {
    Provider: ThisProvider,
    useCtx,
    useHasProvider,
  };
}
