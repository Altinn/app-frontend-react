import { useEffect } from 'react';

import { skipToken, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import type { QueryDefinition } from 'src/core/queries/usePrefetchQuery';
import type { IPdfFormat } from 'src/features/pdf/types';

// Also used for prefetching @see formPrefetcher.ts
export function usePdfFormatQueryDef(instanceId?: string, dataGuid?: string): QueryDefinition<IPdfFormat> {
  const { fetchPdfFormat } = useAppQueries();
  return {
    queryKey: ['fetchPdfFormat', instanceId, dataGuid],
    queryFn: instanceId && dataGuid ? () => fetchPdfFormat(instanceId, dataGuid) : skipToken,
  };
}

export const usePdfFormatQuery = (enabled: boolean): UseQueryResult<IPdfFormat> => {
  const instanceId = useLaxInstance()?.instanceId;
  const dataGuid = useCurrentDataModelGuid();

  const ready = typeof dataGuid === 'string';
  const utils = useQuery({
    enabled: enabled && ready,
    gcTime: 0,
    ...usePdfFormatQueryDef(instanceId, dataGuid),
  });

  useEffect(() => {
    utils.error && window.logError('Fetching PDF format failed:\n', utils.error);
  }, [utils.error]);

  return utils;
};
