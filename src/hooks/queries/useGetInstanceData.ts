import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { maybeAuthenticationRedirect } from 'src/utils/maybeAuthenticationRedirect';
import type { IInstance } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export const tmpSagaInstanceData: { current: IInstance | null } = { current: null };

export function useGetInstanceData() {
  const instantiating = useAppSelector((state) => state.instantiation.instantiating);
  const instanceId = useAppSelector((state) => state.instantiation.instanceId);
  const enabled = !instantiating && !instanceId;

  const instanceIdFromUrl = useInstanceIdParams()?.instanceId;
  window.instanceId = instanceIdFromUrl;

  const { fetchInstanceData } = useAppQueries();
  return useQuery({
    queryKey: ['fetchInstanceData', instanceIdFromUrl],
    queryFn: () => fetchInstanceData(`${instanceIdFromUrl}`),
    enabled: enabled && !!instanceIdFromUrl,
    onSuccess: (instanceData) => {
      tmpSagaInstanceData.current = instanceData;
    },
    onError: async (error: HttpClientError) => {
      tmpSagaInstanceData.current = null;
      await maybeAuthenticationRedirect(error);
      window.logError('Fetching instance data failed:\n', error);
    },
  });
}
