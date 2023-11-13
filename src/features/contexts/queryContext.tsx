import React from 'react';
import type { PropsWithChildren } from 'react';

import type { UseQueryResult } from '@tanstack/react-query';

import { createStrictContext } from 'src/features/contexts/createContext';
import { DisplayError } from 'src/features/errorHandling/DisplayError';
import { Loader } from 'src/features/loading/Loader';
import type { StrictContextProps } from 'src/features/contexts/createContext';

interface QueryContextProps<T> extends StrictContextProps {
  useQuery: () => UseQueryResult<T>;
}

interface GenericProviderProps<T> extends PropsWithChildren {
  name: string;
  useQuery: () => UseQueryResult<T>;
  RealProvider: React.Provider<T>;
}

function GenericProvider<T>({ children, useQuery, RealProvider, name }: GenericProviderProps<T>) {
  const { data, isLoading, error } = useQuery();

  if (!data || isLoading) {
    return <Loader reason={`query-${name}`} />;
  }

  if (error) {
    return <DisplayError error={error as Error} />;
  }

  return <RealProvider value={data}>{children}</RealProvider>;
}

export function createStrictQueryContext<T>({ name, errorMessage, useQuery }: QueryContextProps<T>) {
  const { Provider, useCtx } = createStrictContext<T>({ name, errorMessage });

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
  };
}
