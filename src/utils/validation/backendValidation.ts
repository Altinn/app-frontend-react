import { BackendValidationSeverity } from 'src/utils/validation/backendValidationSeverity';
import { buildValidationObject, unmappedError } from 'src/utils/validation/validationHelpers';
import { validationTexts } from 'src/utils/validation/validationTexts';
import type { IUseLanguage } from 'src/hooks/useLanguage';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';
import type { BackendValidationIssue, IValidationObject, ValidationSeverity } from 'src/utils/validation/types';

/**
 * We need to map the severity we get from backend into the format used when storing in redux.
 */
export const severityMap: { [s in BackendValidationSeverity]: ValidationSeverity } = {
  [BackendValidationSeverity.Error]: 'errors',
  [BackendValidationSeverity.Warning]: 'warnings',
  [BackendValidationSeverity.Informational]: 'info',
  [BackendValidationSeverity.Success]: 'success',
  [BackendValidationSeverity.Fixed]: 'fixed',
  [BackendValidationSeverity.Unspecified]: 'unspecified',
};

export enum ValidationIssueSources {
  File = 'File',
  ModelState = 'ModelState',
  Required = 'Required',
}

/**
 * Some validations performed by the backend are also performed by the frontend.
 * We need to ignore these to prevent duplicate errors.
 */
export function shouldExcludeValidationIssue(issue: BackendValidationIssue): boolean {
  /*
   * Legacy required validation detection
   * Remove this condition in v4, assuming that a minimum backend version is required.
   */
  if (issue.code == 'required' && issue.code != issue.description) {
    // Ignore required validations from backend. They will be duplicated by frontend running the same logic.
    // verify that code != description because user validations always have code == description
    // and we don't want issues in case someone wants to set additional required validations in backend
    // and uses "required" as a key.

    // Using "required" as key will likeliy be OK in the future, if we manage to inteligently deduplicate
    // errors with a shared code. (eg, only display one error with code "required" per component)
    return true;
  }

  if (issue.source === ValidationIssueSources.Required) {
    // Required validations are handled by the frontend.
    return true;
  }

  // eslint-disable-next-line sonarjs/prefer-single-boolean-return
  if (issue.source === ValidationIssueSources.ModelState) {
    // This is handled by schema validation.
    return true;
  }

  return false;
}

/**
 * Gets standard validation messages for backend validation issues.
 */
export function getValidationMessage(
  issue: BackendValidationIssue,
  langTools: IUseLanguage,
  params?: string[],
): string {
  const { langAsString } = langTools;
  if (issue.customTextKey) {
    return langAsString(issue.customTextKey, params);
  }

  if (issue.source && issue.code) {
    const resource = validationTexts[issue.source]?.[issue.code];
    if (resource) {
      return langAsString(resource, params);
    }
  }

  // Fallback to old behavior if source not set.
  const legacyText = langAsString(issue.code, params);
  if (legacyText !== issue.code) {
    return legacyText;
  }

  if (issue.description) {
    return issue.description;
  }

  return issue.source ? `${issue.source}.${issue.code}` : issue.code;
}

/**
 * Maps validation issues from the backend into the intermediate format used by the frontend.
 */
export function mapValidationIssues(
  issues: BackendValidationIssue[],
  resolvedNodes: LayoutPages,
  langTools: IUseLanguage,
): IValidationObject[] {
  if (!resolvedNodes) {
    return [];
  }

  const allNodes = resolvedNodes
    .allNodes()
    .filter(
      (node) =>
        !node.isHidden({ respectTracks: true }) && !('renderAsSummary' in node.item && node.item.renderAsSummary),
    );

  const validationOutputs: IValidationObject[] = [];
  for (const issue of issues) {
    if (shouldExcludeValidationIssue(issue)) {
      continue;
    }

    const { field, severity } = issue;
    const message = getValidationMessage(issue, langTools);

    if (!field) {
      // Unmapped error
      validationOutputs.push(unmappedError(severityMap[severity], message));
    }

    for (const node of allNodes) {
      // Special case for FileUpload and FileUploadWithTag
      if ((node.isType('FileUpload') || node.isType('FileUploadWithTag')) && node.item.id === field) {
        validationOutputs.push(buildValidationObject(node, severityMap[severity], message));
        continue;
      }

      if ('dataModelBindings' in node.item && node.item.dataModelBindings) {
        const bindings = Object.entries(node.item.dataModelBindings);
        for (const [bindingKey, bindingField] of bindings) {
          if (bindingField === field) {
            validationOutputs.push(buildValidationObject(node, severityMap[severity], message, bindingKey));
          }
        }
      }
    }
  }
  return validationOutputs;
}
