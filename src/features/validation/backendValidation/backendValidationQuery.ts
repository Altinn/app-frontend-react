import { useCallback, useEffect, useMemo } from 'react';

import { skipToken, useIsFetching, useQuery, useQueryClient } from '@tanstack/react-query';

import type { BackendValidationIssue } from '..';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { appSupportsIncrementalValidationFeatures } from 'src/features/validation/backendValidation/backendValidationUtils';

/**
 * The same queryKey must be used for all of the functions below
 */
function useBackendValidationQueryKey() {
  const instanceId = useLaxInstance()?.instanceId;
  const currentProcessTaskId = useLaxProcessData()?.currentTask?.elementId;

  return useMemo(() => ['validation', instanceId, currentProcessTaskId], [currentProcessTaskId, instanceId]);
}

export function useGetCachedInitialValidations() {
  const queryKey = useBackendValidationQueryKey();
  const client = useQueryClient();

  return useCallback(
    () => ({
      isFetching: client.isFetching({ queryKey }),
      cachedInitialValidations: client.getQueryData(queryKey),
    }),
    [client, queryKey],
  );
}

export function useUpdateInitialValidations() {
  const queryKey = useBackendValidationQueryKey();
  const client = useQueryClient();

  return useCallback(
    (validations: BackendValidationIssue[]) => {
      client.setQueryData(queryKey, validations);
    },
    [client, queryKey],
  );
}

export function useIsUpdatingInitialValidations() {
  return useIsFetching({ queryKey: ['validation'] }) > 0;
}

export function useInvalidateInitialValidations() {
  const queryKey = useBackendValidationQueryKey();
  const client = useQueryClient();

  return useCallback(
    (onlyIncrementalValidators = false) => {
      if (onlyIncrementalValidators) {
        // This will reset the query state so that useIsInitialValidation will return true again,
        // and therefore we will run the query with onlyIncrementalValidators=true
        return client.resetQueries({ queryKey });
      }
      return client.invalidateQueries({ queryKey });
    },
    [client, queryKey],
  );
}

// Checks if this is the first call to validate or if we are refetching
// returns true if the data has not been updated before
function useIsInitialValidation() {
  const queryKey = useBackendValidationQueryKey();
  const client = useQueryClient();

  return useCallback(() => !client.getQueryState(queryKey)?.dataUpdateCount, [client, queryKey]);
}

/**
 * For backwards compatibility, we need to use the old data element validation API for older apps that do not specify if validations are incrementally updated or not.
 * This is because the old API did not run ITaskValidators, and the regular validate API does. If we cannot tell if validations incrementally update, then
 * we cannot distinguish between regular custom validations and ITaskValidator validations (with a field property set), which will block the user from submitting until they refresh.
 */
function useBackendValidationQueryFunc() {
  const { fetchBackendValidations, fetchBackendValidationsForDataElement } = useAppQueries();
  const shouldUseInstanceValidateAPI = appSupportsIncrementalValidationFeatures(useApplicationMetadata());
  const currentDataElementID = useCurrentDataModelGuid();
  const instanceId = useLaxInstance()?.instanceId;
  const currentLanguage = useCurrentLanguage();
  const isInitialValidation = useIsInitialValidation();

  if (shouldUseInstanceValidateAPI) {
    if (!instanceId) {
      return skipToken;
    }
    return () => fetchBackendValidations(instanceId, currentLanguage, isInitialValidation());
  } else {
    if (!instanceId || !currentDataElementID) {
      return skipToken;
    }
    return () => fetchBackendValidationsForDataElement(instanceId, currentDataElementID, currentLanguage);
  }
}

export function useBackendValidationQuery(enabled: boolean) {
  const queryKey = useBackendValidationQueryKey();
  const queryFn = useBackendValidationQueryFunc();

  const utils = useQuery({
    queryKey,
    queryFn,
    enabled,
    gcTime: 0,
  });

  useEffect(() => {
    utils.error && window.logError('Fetching initial validations failed:\n', utils.error);
  }, [utils.error]);

  return utils;
}
