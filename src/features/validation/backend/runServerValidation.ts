import type { AxiosRequestConfig } from 'axios';

import { ValidationIssueSources, ValidationUrgency } from '..';
import type { BackendValidationIssue, NodeDataChange, ValidationState } from '..';

import {
  getValidationIssueMessage,
  getValidationIssueSeverity,
  getValidationIssueUrgency,
} from 'src/features/validation/backend/backendUtils';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { duplicateStringFilter } from 'src/utils/stringHelper';
import type { IUseLanguage } from 'src/hooks/useLanguage';

/**
 * A temporary replacement for runSingleFieldValidation / getting all validations from server,
 * This should ideally be handled in the call to save form data.
 */
export async function runServerValidations(
  nodeChanges: NodeDataChange[],
  url: string | undefined,
  langTools: IUseLanguage,
): Promise<ValidationState> {
  const state: ValidationState = {
    fields: {},
    components: {},
    task: [],
  };

  if (!nodeChanges.length || !url) {
    return Promise.resolve(state);
  }

  const changedFields = nodeChanges.flatMap((nc) => nc.fields).filter(duplicateStringFilter);

  if (!changedFields.length) {
    return Promise.resolve(state);
  }

  for (const changedField of changedFields) {
    state.fields[changedField] = {
      [ValidationIssueSources.Required]: [],
      [ValidationIssueSources.ModelState]: [],
      [ValidationIssueSources.Custom]: [],
      [ValidationIssueSources.Expression]: [],
    };
  }

  const options: AxiosRequestConfig =
    changedFields.length === 1
      ? {
          headers: {
            ValidationTriggerField: encodeURIComponent(changedFields[0]),
          },
        }
      : {};

  const validationIssues: BackendValidationIssue[] = await httpGet(url, options);

  // Map validation issues to state
  for (const issue of validationIssues) {
    const { field, source: group } = issue;
    const severity = getValidationIssueSeverity(issue);
    const message = getValidationIssueMessage(issue, langTools);
    const urgency = getValidationIssueUrgency(issue);

    if (!field) {
      // Unmapped error
      if (!state.task.find((v) => v.message === message && v.severity === severity)) {
        state.task.push({ severity, message, urgency: ValidationUrgency.OnFormSubmit });
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
     * Allow fixed validation to clear the group, but there is no need to add it.
     * This is a temporary way to almost support *FIXED* validations,
     * the only caveat is that it will clear ALL custom validations for the field,
     * instead of just the one.
     */
    if (severity != 'fixed') {
      state.fields[field][group].push({ field, severity, message, group, urgency });
    }
  }

  return state;
}
