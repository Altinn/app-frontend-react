import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { createStrictQueryContext } from 'src/features/contexts/queryContext';
import { CustomValidationActions } from 'src/features/customValidation/customValidationSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { resolveExpressionValidationConfig } from 'src/utils/validation/expressionValidation';
import type { IExpressionValidationConfig } from 'src/utils/validation/types';

const useCustomValidationConfigQuery = (
  dataTypeId: string | undefined,
): UseQueryResult<IExpressionValidationConfig | null> => {
  const dispatch = useAppDispatch();
  const { fetchCustomValidationConfig } = useAppQueries();

  return useQuery({
    queryKey: ['fetchCustomValidationConfig', dataTypeId],
    queryFn: () => fetchCustomValidationConfig(dataTypeId!),
    enabled: Boolean(dataTypeId?.length),
    onSuccess: (customValidationConfig) => {
      if (customValidationConfig) {
        const validationDefinition = resolveExpressionValidationConfig(customValidationConfig);
        dispatch(CustomValidationActions.fetchCustomValidationsFulfilled(validationDefinition));
      } else {
        dispatch(CustomValidationActions.fetchCustomValidationsFulfilled(null));
      }
    },
    onError: (error: AxiosError) => {
      window.logError('Fetching validation configuration failed:\n', error);
    },
  });
};

const { Provider, useCtx } = createStrictQueryContext<IExpressionValidationConfig | null>({
  name: 'CustomValidationContext',
  useQuery: useCustomValidationConfigQuery,
  // PRIORITY: Supply argument to createStrictQueryContext
});

export const CustomValidationConfigProvider = Provider;
export const useCustomValidationConfig = useCtx;
