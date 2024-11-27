import React from 'react';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { httpGet } from 'src/utils/network/sharedNetworking';
import { applicationMetadataApiUrl } from 'src/utils/urls/appUrlHelper';
import type { IncomingApplicationMetadata } from 'src/features/applicationMetadata/types';

export const fetchApplicationMetadata = () => httpGet<IncomingApplicationMetadata>(applicationMetadataApiUrl);

export const useApplicationMetadata = (): UseQueryResult<IncomingApplicationMetadata, Error> =>
  useQuery<IncomingApplicationMetadata, Error>({
    queryKey: ['applicationMetadata'],
    queryFn: fetchApplicationMetadata,
  });

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <InitialState />
  </QueryClientProvider>
);

function InitialState() {
  const { data, error, isLoading } = useApplicationMetadata();

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
