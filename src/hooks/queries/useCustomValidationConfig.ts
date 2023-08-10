import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';
import { CustomValidationActions } from 'src/features/customValidation/customValidationSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { getCurrentDataTypeForApplication } from 'src/utils/appMetadata';
import { resolveExpressionValidationConfig } from 'src/utils/validation/expressionValidation';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { ILayoutSets } from 'src/types';
import type { IInstance } from 'src/types/shared';
import type { IExpressionValidationConfig } from 'src/utils/validation/types';

enum ServerStateCacheKey {
  ValidationConfig = 'validationConfig',
}

export const useCustomValidationConfig = (enabled: boolean): UseQueryResult<IExpressionValidationConfig | null> => {
  const dispatch = useAppDispatch();
  const { fetchCustomValidationConfig } = useAppQueriesContext();

  const appMetadata: IApplicationMetadata | null = useAppSelector(
    (state) => state.applicationMetadata.applicationMetadata,
  );
  const instance: IInstance | null = useAppSelector((state) => state.instanceData.instance);
  const layoutSets: ILayoutSets | null = useAppSelector((state) => state.formLayout.layoutsets);

  const dataTypeId =
    getCurrentDataTypeForApplication({
      application: appMetadata,
      instance,
      layoutSets,
    }) ?? '';

  return useQuery([ServerStateCacheKey.ValidationConfig, dataTypeId], () => fetchCustomValidationConfig(dataTypeId), {
    enabled: enabled && Boolean(dataTypeId?.length),
    onSuccess: (customValidationConfig) => {
      if (!customValidationConfig) {
        return;
      }
      const validationDefinition = resolveExpressionValidationConfig(customValidationConfig);
      dispatch(CustomValidationActions.fetchCustomValidationsFulfilled(validationDefinition));
    },
    onError: (error: AxiosError) => {
      if (error.response?.status !== 404) {
        dispatch(CustomValidationActions.fetchCustomValidationsRejected(error));
        window.logError('Fetching validation configuration failed:\n', error);
      }
    },
  });
};
