import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { createLaxQueryContext } from 'src/features/contexts/queryContext';
import { CustomValidationActions } from 'src/features/customValidation/customValidationSlice';
import { useCurrentDataModelName } from 'src/features/datamodel/useBindingSchema';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { resolveExpressionValidationConfig } from 'src/utils/validation/expressionValidation';
import type { IExpressionValidationConfig } from 'src/utils/validation/types';

const useCustomValidationConfigQuery = () => {
  const dispatch = useAppDispatch();
  const { fetchCustomValidationConfig } = useAppQueries();
  const dataTypeId = useCurrentDataModelName();
  const enabled = Boolean(dataTypeId?.length);

  const utils = useQuery({
    enabled,
    queryKey: ['fetchCustomValidationConfig', dataTypeId],
    queryFn: () => fetchCustomValidationConfig(dataTypeId!),
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

  return {
    ...utils,
    enabled,
  };
};

const { Provider, useCtx } = createLaxQueryContext<IExpressionValidationConfig | null>({
  name: 'CustomValidationContext',
  useQuery: useCustomValidationConfigQuery,
});

export const CustomValidationConfigProvider = Provider;
export const useCustomValidationConfig = useCtx;
