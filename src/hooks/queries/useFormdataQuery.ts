import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import type { IRepeatingGroups } from 'src/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

enum ServerStateCacheKey {
  FormData = 'formData',
}
export const useFormDataQuery = (
  instanceId: string,
  currentTaskDataId: string,
  enabled?: boolean,
): UseQueryResult<IRepeatingGroups> => {
  const { fetchFormData } = useAppQueriesContext();

  return useQuery(
    [ServerStateCacheKey.FormData, instanceId, currentTaskDataId],
    () => fetchFormData(instanceId, currentTaskDataId),
    {
      enabled,
      onSuccess: () => {},
      onError: (error: HttpClientError) => {
        window.logError('Fetching FormData failed:\n', error);
      },
    },
  );
};
