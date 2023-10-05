import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { CustomValidationActions } from 'src/features/customValidation/customValidationSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { getCurrentDataTypeForApplication } from 'src/utils/appMetadata';
import { resolveExpressionValidationConfig } from 'src/utils/validation/expressionValidation';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { ILayoutSets } from 'src/types';
import type { IInstance } from 'src/types/shared';
import type { IExpressionValidationConfig } from 'src/utils/validation/types';

export const useCustomValidationConfig = (): UseQueryResult<IExpressionValidationConfig | null> => {
  const dispatch = useAppDispatch();
  const { fetchCustomValidationConfig } = useAppQueries();

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

  return useQuery(['fetchCustomValidationConfig', dataTypeId], () => fetchCustomValidationConfig(dataTypeId), {
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
      dispatch(CustomValidationActions.fetchCustomValidationsRejected(error));
      window.logError('Fetching validation configuration failed:\n', error);
    },
  });
};
