import { BackendValidationSeverity } from 'src/utils/validation/backendValidationSeverity';
import { validationTexts } from 'src/utils/validation/validationTexts';
import type { IUseLanguage } from 'src/hooks/useLanguage';
import type { BackendValidationIssue, ValidationSeverity } from 'src/utils/validation/types';

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
  Expression = 'Expression',
  Custom = 'Custom',
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
