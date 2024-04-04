import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { resolveExpressionValidationConfig } from 'src/features/customValidation/customValidationUtils';

export const useCustomValidationConfigQuery = (dataTypeId: string) => {
  const { fetchCustomValidationConfig } = useAppQueries();
  const enabled = Boolean(dataTypeId?.length);

  const utils = useQuery({
    enabled,
    queryKey: ['fetchCustomValidationConfig', dataTypeId],
    queryFn: () => fetchCustomValidationConfig(dataTypeId!),
    select: (config) => (config ? resolveExpressionValidationConfig(config) : null),
  });

  useEffect(() => {
    utils.error && window.logError('Fetching validation configuration failed:\n', utils.error);
  }, [utils.error]);

  return {
    ...utils,
    enabled,
  };
};
