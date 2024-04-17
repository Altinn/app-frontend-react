import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { useCurrentDataModelGuid, useCurrentDataModelName } from 'src/features/datamodel/useBindingSchema';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import type { IPdfFormat } from 'src/features/pdf/types';

/**
 * This exists to suport the legacy IPdfFormatter interface which was used with the old PDF generator to make it easier to migrate from the old one.
 * The IPdfFormatter interface is marked as obsolete in app-lib v8+ and can therefore be considered to be deprecated in frontend v4 as well.
 * For some reason, the API requires the dataGuid of the data element for the current task instead of the task id. This therefore uses the default data model (from layout-sets),
 * and does not care about any additional data models.
 * @deprecated should be removed in the next major version
 */
export const usePdfFormatQuery = (enabled: boolean): UseQueryResult<IPdfFormat> => {
  const { fetchPdfFormat } = useAppQueries();
  const dataType = useCurrentDataModelName();
  const formData = FD.useDebounced(dataType!);

  const instanceId = useLaxInstance()?.instanceId;
  const dataGuid = useCurrentDataModelGuid();

  const ready = typeof dataGuid === 'string';
  const utils = useQuery({
    enabled: enabled && ready,
    queryKey: ['fetchPdfFormat', instanceId, dataGuid, formData],
    queryFn: () => fetchPdfFormat(instanceId!, dataGuid!),
  });

  useEffect(() => {
    utils.error && window.logError('Fetching PDF format failed:\n', utils.error);
  }, [utils.error]);

  return utils;
};
