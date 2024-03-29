import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { resolveExpressionValidationConfig } from 'src/features/customValidation/customValidationUtils';
import { useCurrentDataModelName } from 'src/features/datamodel/useBindingSchema';
import type { IExpressionValidationConfig, IExpressionValidations } from 'src/features/validation';

const useCustomValidationConfigQuery = () => {
  const { fetchCustomValidationConfig } = useAppQueries();
  const dataTypeId = useCurrentDataModelName();
  const enabled = Boolean(dataTypeId?.length);

  const utils = useQuery({
    enabled,
    queryKey: ['fetchCustomValidationConfig', dataTypeId],
    queryFn: () => fetchCustomValidationConfig(dataTypeId!),
  });

  useEffect(() => {
    utils.error && window.logError('Fetching validation configuration failed:\n', utils.error);
  }, [utils.error]);

  return {
    ...utils,
    enabled,
  };
};

const { Provider, useCtx } = delayedContext(() =>
  createQueryContext<IExpressionValidationConfig | null, false, IExpressionValidations | null>({
    name: 'CustomValidationContext',
    required: false,
    default: null,
    query: useCustomValidationConfigQuery,
    process: (queryData) => (queryData ? resolveExpressionValidationConfig(queryData) : null),
  }),
);

export const CustomValidationConfigProvider = Provider;
export const useCustomValidationConfig = () => useCtx();
