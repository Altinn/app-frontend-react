import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import type { IRepeatingGroups } from 'src/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

enum ServerStateCacheKey {
  FormData = 'formData',
}
export const useFormDataForOptionsQuery = (
  instanceId: string,
  currentTaskDataId: string,
  enabled?: boolean,
): UseQueryResult<IRepeatingGroups> => {
  const { fetchFormDataForOptions } = useAppQueriesContext();

  return useQuery(
    [ServerStateCacheKey.FormData, instanceId, currentTaskDataId],
    () => fetchFormDataForOptions(instanceId, currentTaskDataId),
    {
      enabled,
      onSuccess: () => {},
      onError: (error: HttpClientError) => {
        window.logError('Fetching FormData failed:\n', error);
      },
    },
  );
};
