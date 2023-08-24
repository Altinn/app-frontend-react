import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

enum ServerStateCacheKey {
  Layout = 'fetchLayout',
}
export const useLayoutQuery = (layoutSetId: string | null, enabled?: boolean): UseQueryResult<any> => {
  const { fetchLayout } = useAppQueriesContext();
  return useQuery([ServerStateCacheKey.Layout], () => fetchLayout(layoutSetId), {
    enabled,
    onSuccess: () => {},
    onError: (error: HttpClientError) => {
      window.logError('Fetching layout sets failed:\n', error);
    },
  });
};
