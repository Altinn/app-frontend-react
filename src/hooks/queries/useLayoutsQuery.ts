import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { cleanLayout } from 'src/features/layout/fetch/fetchFormLayoutSagas';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

enum ServerStateCacheKey {
  Layout = 'fetchLayouts',
}
export const useLayoutsQuery = (layoutSetId: string | null, enabled?: boolean): UseQueryResult<any> => {
  const { fetchLayout } = useAppQueriesContext();
  return useQuery([ServerStateCacheKey.Layout], () => fetchLayout(layoutSetId).then((data) => handleData(data)), {
    enabled,
    onSuccess: () => {},
    onError: (error: HttpClientError) => {
      window.logError('Fetching layout sets failed:\n', error);
    },
  });
};

const handleData = (data: any) => {
  for (const key of Object.keys(data).sort()) {
    const layoutData = data[key]?.data.layout;
    data[key] = cleanLayout(layoutData || []);
  }
  return data;
};
