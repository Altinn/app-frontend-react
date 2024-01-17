import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useImmer } from 'use-immer';

import type { BackendValidations, BackendValidatorGroups } from '..';

import { useAppMutations, useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { mapValidationIssueToFieldValidation } from 'src/features/validation/backend/backendUtils';

export function useBackendValidation(): BackendValidations {
  const [backendValidatorGroups, setBackendValidatorGroups] = useImmer<BackendValidatorGroups>({});

  /**
   * Run full validation initially
   */
  const { fetchBackendValidations } = useAppQueries();
  const instanceId = useLaxInstance()?.instanceId;
  const currentDataElementId = useCurrentDataModelGuid();

  const { data: initialValidations } = useQuery({
    queryKey: ['validation', instanceId, currentDataElementId],
    queryFn: () =>
      instanceId?.length && currentDataElementId?.length
        ? fetchBackendValidations(instanceId, currentDataElementId)
        : [],
  });

  useEffect(() => {
    setBackendValidatorGroups(
      initialValidations?.map(mapValidationIssueToFieldValidation)?.reduce((validatorGroups, validation) => {
        if (!validatorGroups[validation.source]) {
          validatorGroups[validation.source] = [];
        }
        validatorGroups[validation.source].push(validation);
        return validatorGroups;
      }, {}) ?? {},
    );
  }, [initialValidations, setBackendValidatorGroups]);

  /**
   * Incrementally update validation state with each response from json-patch.
   */
  const { doPatchFormData } = useAppMutations();

  useEffect(() => {
    const validators = doPatchFormData.lastResult?.validationIssues;

    if (typeof validators === 'undefined' || Object.keys(validators).length === 0) {
      return;
    }

    setBackendValidatorGroups((validatorState) => {
      for (const [group, validationIssues] of Object.entries(validators)) {
        validatorState[group] = validationIssues.map(mapValidationIssueToFieldValidation);
      }
    });
  }, [doPatchFormData.lastResult, setBackendValidatorGroups]);

  /**
   * Map validator groups to validations per field
   */
  return useMemo(() => {
    const backendValidations: BackendValidations = {
      task: [],
      fields: {},
    };

    for (const validations of Object.values(backendValidatorGroups)) {
      for (const validation of validations) {
        if ('field' in validation) {
          if (!backendValidations.fields[validation.field]) {
            backendValidations.fields[validation.field] = [];
          }
          backendValidations.fields[validation.field].push(validation);
        } else {
          // Unmapped error (task validation)
          backendValidations.task.push(validation);
        }
      }
    }

    return backendValidations;
  }, [backendValidatorGroups]);
}
