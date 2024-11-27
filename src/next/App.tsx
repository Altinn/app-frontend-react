import React, { useEffect } from 'react';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { initialStateUrl } from 'src/next/actions/appUrls';
import { useInstantiateMutation } from 'src/next/mutations/intanceMutation';
import { httpGet } from 'src/utils/network/sharedNetworking';
import type { InitialState } from 'src/next/types/InitialState';

//import type { IncomingApplicationMetadata } from 'src/features/applicationMetadata/types';

export const fetchInitialStateUrl = () => httpGet<InitialState>(initialStateUrl);

export const useApplicationMetadata = (): UseQueryResult<InitialState, Error> =>
  useQuery<InitialState, Error>({
    queryKey: ['initialState'],
    queryFn: fetchInitialStateUrl,
  });

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <Routes>
        <Route
          path='/'
          element={<InitialStateComponent />}
        />
        <Route
          path='/instance/:partyId/:instanceGuid/*'
          element={<div>This be instance</div>}
        >
          {/*<Route*/}
          {/*  path=':taskId/*'*/}
          {/*  element={<ProcessWrapper />}*/}
          {/*/>*/}
          {/*<Route*/}
          {/*  index*/}
          {/*  element={<NavigateToStartUrl />}*/}
          {/*/>*/}
        </Route>
      </Routes>
    </HashRouter>
  </QueryClientProvider>
);

function InitialStateComponent() {
  const { data, error, isLoading } = useApplicationMetadata();

  const instanceMutation = useInstantiateMutation();
  const navigate = useNavigate();
  //  data?.applicationMetadata.

  useEffect(() => {
    if (data && !isLoading) {
      instanceMutation.mutate(data.user.partyId);
    }
  }, [data]);

  useEffect(() => {
    if (instanceMutation.isSuccess) {
      navigate(`/instance/${instanceMutation.data.id}`);
    }
  }, [instanceMutation]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error loading application metadata.</div>;
  }

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
