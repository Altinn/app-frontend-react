import { useEffect, useMemo } from 'react';

import { useImmer } from 'use-immer';

import { ValidationIssueSources, ValidationMask } from '..';
import type { BackendValidations, BackendValidatorGroups } from '..';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { getValidationIssueMessage, getValidationIssueSeverity } from 'src/features/validation/backend/backendUtils';

export function useBackendValidation(): BackendValidations {
  const { doPatchFormData } = useAppMutations();

  const [backendValidatorGroups, setBackendValidatorGroups] = useImmer<BackendValidatorGroups>({});

  useEffect(() => {
    const validators = doPatchFormData.lastResult?.validationIssues;

    if (typeof validators === 'undefined' || Object.keys(validators).length === 0) {
      return;
    }

    setBackendValidatorGroups((validatorState) => {
      for (const [group, validationIssues] of Object.entries(validators)) {
        validatorState[group] = validationIssues.map((issue) => {
          const { field, source } = issue;
          const severity = getValidationIssueSeverity(issue);
          const message = getValidationIssueMessage(issue);

          let category: number = ValidationMask.Backend;
          if (source === ValidationIssueSources.Custom) {
            if (issue.showImmediately) {
              category = 0;
            } else if (issue.actLikeRequired) {
              category = ValidationMask.Required;
            } else {
              category = ValidationMask.CustomBackend;
            }
          }

          if (!field) {
            // Unmapped error (task validation)
            return { severity, message, category, source };
          }

          return { field, severity, message, category, source };
        });
      }
    });
  }, [doPatchFormData.lastResult, setBackendValidatorGroups]);

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
