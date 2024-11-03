import { useCallback, useMemo } from 'react';

import { skipToken, useQueries, useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { fetchExternalApi } from 'src/queries/queries';

export type ExternalApisResult = { data: Record<string, unknown>; errors: Record<string, Error> };

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
    staleTime: 1000 * 60 * 10, // 10 minutes
  };
}

export function useExternalApis(ids: string[] | undefined): ExternalApisResult {
  const instanceId = useLaxInstanceId();
  const queries = useMemo(
    () =>
      (ids ?? []).map((externalApiId) => ({
        ...getExternalApiQueryDef({ externalApiId, instanceId }),
      })),
    [ids, instanceId],
  );

  return useQueries({
    queries,
    combine: useCallback(
      (results: UseQueryResult<unknown, Error>[]) => {
        const data: Record<string, unknown> = {};
        const errors: Record<string, Error> = {};

        ids?.forEach((externalApiId, idx) => {
          data[externalApiId] = results[idx].data;
          if (results[idx].error) {
            errors[externalApiId] = results[idx].error;
          }
        });

        Object.entries(errors).forEach(([id, error]) => {
          window.logErrorOnce(`Failed to fetch external API ${id}`, error);
        });

        return { data, errors };
      },
      [ids],
    ),
  });
}

export function useExternalApi(id: string): unknown {
  const instanceId = useLaxInstanceId();

  return useQuery(getExternalApiQueryDef({ externalApiId: id, instanceId }));
}
