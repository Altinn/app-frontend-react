import React, { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createStrictContext } from 'src/utils/createContext';
import type * as queries from 'src/queries/queries';

type KeysStartingWith<T, U extends string> = {
  [K in keyof T as K extends `${U}${string}` ? K : never]: T[K];
};

export type AppQueriesContext = typeof queries;

type Queries = KeysStartingWith<AppQueriesContext, 'fetch'>;
type Mutations = KeysStartingWith<AppQueriesContext, 'do'>;
export type EnhancedMutations = {
  [K in keyof Mutations]: {
    call: Mutations[K];
    lastResult: Awaited<ReturnType<Mutations[K]>> | undefined;
    setLastResult: (result: Awaited<ReturnType<Mutations[K]>>) => void;
  };
};

interface ContextData {
  queries: Queries;
  mutations: EnhancedMutations;
}

const { Provider, useCtx } = createStrictContext<ContextData>({ name: 'AppQueriesContext' });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppQueriesProvider = ({ children, ...allQueries }: React.PropsWithChildren<AppQueriesContext>) => {
  const queries = Object.fromEntries(Object.entries(allQueries).filter(([key]) => key.startsWith('fetch'))) as Queries;
  const mutations = Object.fromEntries(Object.entries(allQueries).filter(([key]) => key.startsWith('do'))) as Mutations;

  const enhancedMutations = Object.fromEntries(
    Object.entries(mutations).map(([key, mutation]) => {
      // As long as the queries are all the same each time, this should be fine
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [lastResult, setLastResult] = useState<Awaited<ReturnType<typeof mutation>>>();
      return [key, { call: mutation, lastResult, setLastResult }];
    }),
  ) as EnhancedMutations;

  return (
    <QueryClientProvider client={queryClient}>
      <Provider value={{ queries, mutations: enhancedMutations }}>{children}</Provider>
    </QueryClientProvider>
  );
};

export const useAppQueries = () => useCtx().queries;
export const useAppMutations = () => useCtx().mutations;
export const useLastMutationResult = <K extends keyof Mutations>(
  key: K,
): Awaited<ReturnType<Mutations[K]>> | undefined => {
  const { lastResult } = useAppMutations()[key];
  return lastResult;
};
