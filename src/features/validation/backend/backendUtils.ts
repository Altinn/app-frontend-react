import { BackendValidationSeverity } from 'src/features/validation';
import { validationTexts } from 'src/features/validation/backend/validationTexts';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { BackendValidationIssue, ValidationSeverity } from 'src/features/validation';

/**
 * We need to map the severity we get from backend into the format used when storing in redux.
 */
const severityMap: { [s in BackendValidationSeverity]: ValidationSeverity } = {
  [BackendValidationSeverity.Error]: 'error',
  [BackendValidationSeverity.Warning]: 'warning',
  [BackendValidationSeverity.Informational]: 'info',
  [BackendValidationSeverity.Success]: 'success',
};

export function getValidationIssueSeverity(issue: BackendValidationIssue): ValidationSeverity {
  return severityMap[issue.severity];
}

/**
 * Gets standard validation messages for backend validation issues.
 */
export function getValidationIssueMessage(
  issue: BackendValidationIssue,
  langTools: IUseLanguage,
  params?: string[],
): string {
  const { langAsNonProcessedString } = langTools;
  if (issue.customTextKey) {
    return langAsNonProcessedString(issue.customTextKey, params);
  }

  if (issue.source && issue.code) {
    const resource = validationTexts[issue.source]?.[issue.code];
    if (resource) {
      return langAsNonProcessedString(resource, params);
    }
  }

  // Fallback to old behavior if source not set.
  const legacyText = langAsNonProcessedString(issue.code, params);
  if (legacyText !== issue.code) {
    return legacyText;
  }

  if (issue.description) {
    return issue.description;
  }

  return issue.source ? `${issue.source}.${issue.code}` : issue.code;
}
