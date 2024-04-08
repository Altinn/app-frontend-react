import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import type { BackendValidatorGroups } from '..';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { getFirstDataElementId } from 'src/features/applicationMetadata/appMetadataUtils';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { mapValidationIssueToFieldValidation } from 'src/features/validation/backendValidation/backendValidationUtils';

export function useBackendValidationQuery(dataType: string, enabled: boolean) {
  const currentLanguage = useCurrentLanguage();
  const instance = useLaxInstance();
  const instanceId = instance?.instanceId;
  const dataElementId = instance?.data ? getFirstDataElementId(instance.data, dataType) : undefined;

  const { fetchBackendValidations } = useAppQueries();

  const utils = useQuery({
    // Validations are only fetched to initially populate the context, after that we keep the state internally
    gcTime: 0,
    retry: false,

    queryKey: ['validation', instanceId, dataElementId],
    enabled,
    queryFn: () =>
      instanceId?.length && dataElementId?.length
        ? fetchBackendValidations(instanceId, dataElementId, currentLanguage)
        : [],
    select: (initialValidations) =>
      (initialValidations.map(mapValidationIssueToFieldValidation).reduce((validatorGroups, validation) => {
        if (!validatorGroups[validation.source]) {
          validatorGroups[validation.source] = [];
        }
        validatorGroups[validation.source].push(validation);
        return validatorGroups;
      }, {}) ?? {}) as BackendValidatorGroups,
  });

  useEffect(() => {
    utils.error && window.logError('Fetching initial validations failed:\n', utils.error);
  }, [utils.error]);

  return utils;
}
