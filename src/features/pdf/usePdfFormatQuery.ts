import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import type { IPdfFormat } from 'src/features/pdf/types';

export const usePdfFormatQuery = (enabled: boolean): UseQueryResult<IPdfFormat> => {
  const { fetchPdfFormat } = useAppQueries();

  const instanceId = useLaxInstance()?.instanceId;
  const dataGuid = useCurrentDataModelGuid();

  const ready = typeof dataGuid === 'string';
  const utils = useQuery({
    enabled: enabled && ready,
    gcTime: 0,
    queryKey: ['fetchPdfFormat', instanceId, dataGuid],
    queryFn: () => fetchPdfFormat(instanceId!, dataGuid!),
  });

  useEffect(() => {
    utils.error && window.logError('Fetching PDF format failed:\n', utils.error);
  }, [utils.error]);

  return utils;
};
