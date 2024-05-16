import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import type { BackendValidationIssue, BackendValidatorGroups } from '..';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { getFirstDataElementId } from 'src/features/applicationMetadata/appMetadataUtils';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { mapValidationIssueToFieldValidation } from 'src/features/validation/backendValidation/backendValidationUtils';
import type { QueryDefinition } from 'src/core/queries/usePrefetchQuery';

// TODO(Datamodels): Prefetch?
export function useBackendValidationQueryDef(
  enabled: boolean,
  currentLanguage: string,
  instanceId?: string,
  currentDataElementId?: string,
): QueryDefinition<BackendValidationIssue[]> {
  const { fetchBackendValidations } = useAppQueries();
  return {
    queryKey: ['validation', instanceId, currentDataElementId, enabled],
    queryFn:
      instanceId && currentDataElementId
        ? () => fetchBackendValidations(instanceId, currentDataElementId, currentLanguage)
        : () => [],
    enabled,
    gcTime: 0,
  };
}

export function useBackendValidationQuery(dataType: string, enabled: boolean) {
  const currentLanguage = useCurrentLanguage();
  const instance = useLaxInstance();
  const instanceId = instance?.instanceId;
  const dataElementId = instance?.data ? getFirstDataElementId(instance.data, dataType) : undefined;

  const utils = useQuery({
    ...useBackendValidationQueryDef(enabled, currentLanguage, instanceId, dataElementId),
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
