import { skipToken, useQueries, useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { fetchExternalApi } from 'src/queries/queries';

export type ExternalApisResult = Record<string, UseQueryResult<unknown>>;

function getExternalApiQueryDef({
  externalApiId,
  instanceId,
}: {
  externalApiId: string;
  instanceId: string | undefined;
}): UseQueryOptions<unknown, Error> {
  return {
    queryKey: ['fetchExternalApi', instanceId, externalApiId],
    queryFn: instanceId ? async () => fetchExternalApi({ instanceId, externalApiId }) : skipToken,
  };
}

export function useExternalApis(ids: string[]): ExternalApisResult {
  const instanceId = useLaxInstance()?.instanceId;
  const queries = ids.map((externalApiId) => ({
    ...getExternalApiQueryDef({ externalApiId, instanceId }),
  }));

  return useQueries({
    queries,
    combine: (results) => {
      const externalApis: ExternalApisResult = {};
      ids.forEach((externalApiId, idx) => {
        externalApis[externalApiId] = { ...results[idx] };
      });
      return externalApis;
    },
  });
}

export function useExternalApi(id: string): unknown {
  const instanceId = useLaxInstance()?.instanceId;

  return useQuery(getExternalApiQueryDef({ externalApiId: id, instanceId }));
}
