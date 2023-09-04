import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { TextResourcesActions } from 'src/features/textResources/textResourcesSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

enum ServerStateCacheKey {
  TextResources = 'textResources',
}
export const useTextResourcesQuery = (language: string, enabled?: boolean): UseQueryResult<any> => {
  const { fetchTextResources } = useAppQueriesContext();
  const dispatch = useAppDispatch();
  return useQuery(
    [ServerStateCacheKey.TextResources],
    () => fetchTextResources(language).then((resource) => mapResponse(resource)),
    {
      enabled,
      onSuccess: (resource) => {
        dispatch(TextResourcesActions.fetchFulfilled({ language: resource.language, resources: resource.resources }));
      },
      onError: (error: HttpClientError) => {
        window.logError('Fetching text resources failed:\n', error);
      },
    },
  );
};

const mapResponse = (resource: any) => {
  resource.resources.forEach((res) => {
    if (res.variables != null) {
      res.unparsedValue = res.value;
    }
  });
  return resource;
};
