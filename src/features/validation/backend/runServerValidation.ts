import { useQuery } from '@tanstack/react-query';

import { type BackendValidationIssue, ValidationIssueSources, ValidationMask, type ValidationState } from '..';

import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { useLanguage } from 'src/features/language/useLanguage';
import { getValidationIssueMessage, getValidationIssueSeverity } from 'src/features/validation/backend/backendUtils';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { getDataValidationUrl } from 'src/utils/urls/appUrlHelper';

export function useBackendValidation() {
  const lastSavedFormData = useAppSelector((state) => state.formData.lastSavedFormData);
  const langTools = useLanguage();
  const instanceId = useLaxInstance()?.instanceId;
  const currentDataElementId = useCurrentDataModelGuid();
  const url =
    instanceId?.length && currentDataElementId?.length
      ? getDataValidationUrl(instanceId, currentDataElementId)
      : undefined;

  const { data: backendValidations, isFetching } = useQuery({
    queryKey: ['validation', instanceId, currentDataElementId, lastSavedFormData],
    queryFn: async () => {
      const state: ValidationState = {
        fields: {},
        components: {},
        task: [],
      };

      if (!url) {
        return Promise.resolve(state);
      }

      const validationIssues: BackendValidationIssue[] = await httpGet(url);

      // Map validation issues to state
      for (const issue of validationIssues) {
        const { field, source: group } = issue;
        const severity = getValidationIssueSeverity(issue);
        const message = getValidationIssueMessage(issue, langTools);

        let category: number = ValidationMask.Backend;
        if (issue.source === ValidationIssueSources.Custom) {
          if (issue.showImmediately) {
            category = 0;
          } else if (issue.actLikeRequired) {
            category = ValidationMask.Required;
          } else {
            category = ValidationMask.CustomBackend;
          }
        }

        if (!field) {
          // Unmapped error
          if (!state.task.find((v) => v.message === message && v.severity === severity)) {
            state.task.push({ severity, message, category });
          }
          continue;
        }

        if (!state.fields[field]) {
          state.fields[field] = {};
        }
        if (!state.fields[field][group]) {
          state.fields[field][group] = [];
        }

        /**
         * There used to be more severities, like 'fixed', since there is a risk of old backend logic still sending fixed,
         * we will ignore it here.
         */
        if (['error', 'warning', 'info', 'success'].includes(severity)) {
          state.fields[field][group].push({ field, severity, message, group, category });
        }
      }

      return state;
    },
  });

  return { backendValidations, isFetching };
}
