import { useEffect } from 'react';

import { skipToken } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { type QueryDefinition, useQueryWithPrefetch } from 'src/core/queries/usePrefetchQuery';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import type { IPdfFormat } from 'src/features/pdf/types';

// Also used for prefetching @see formPrefetcher.ts
export function usePdfFormatQueryDef(
  enabled: boolean,
  instanceId?: string,
  dataGuid?: string,
): QueryDefinition<IPdfFormat> {
  const { fetchPdfFormat } = useAppQueries();
  return {
    queryKey: ['fetchPdfFormat', instanceId, dataGuid, enabled],
    queryFn: instanceId && dataGuid ? () => fetchPdfFormat(instanceId, dataGuid) : skipToken,
    enabled: enabled && !!instanceId && !!dataGuid,
  };
}

export const usePdfFormatQuery = (enabled: boolean): UseQueryResult<IPdfFormat> => {
  const instanceId = useLaxInstance()?.instanceId;
  const dataGuid = useCurrentDataModelGuid();

  const ready = typeof dataGuid === 'string';
  const utils = useQueryWithPrefetch(usePdfFormatQueryDef(enabled && ready, instanceId, dataGuid), { gcTime: 0 });

  useEffect(() => {
    utils.error && window.logError('Fetching PDF format failed:\n', utils.error);
  }, [utils.error]);

  return utils;
};
