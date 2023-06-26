import { staticUseLanguageFromState } from 'src/hooks/useLanguage';
import { resolvedLayoutsFromState } from 'src/utils/layout/hierarchy';
import { buildValidationObject, unmappedError } from 'src/utils/validation/validationHelpers';
import { validationTexts } from 'src/utils/validation/validationTexts';
import type { IUseLanguage } from 'src/hooks/useLanguage';
import type { IRuntimeState } from 'src/types';
import type { IValidationIssue, IValidationObject, ValidationSeverity } from 'src/utils/validation/types';

export enum ValidationIssueSeverity {
  Unspecified = 0,
  Error = 1,
  Warning = 2,
  Informational = 3,
  Fixed = 4,
  Success = 5,
}

export const severityMap: { [s in ValidationIssueSeverity]: ValidationSeverity } = {
  [ValidationIssueSeverity.Error]: 'errors',
  [ValidationIssueSeverity.Warning]: 'warnings',
  [ValidationIssueSeverity.Informational]: 'info',
  [ValidationIssueSeverity.Success]: 'success',
  [ValidationIssueSeverity.Fixed]: 'fixed',
  [ValidationIssueSeverity.Unspecified]: 'unspecified',
};

function shouldExcludeValidationIssue(issue: IValidationIssue): boolean {
  // eslint-disable-next-line sonarjs/prefer-single-boolean-return
  if (issue.code == 'required' && issue.code != issue.description) {
    // Ignore required validations from backend. They will be duplicated by frontend running the same logic.
    // verify that code != description because user validations always have code == description
    // and we don't want issues in case someone wants to set additional required validations in backend
    // and uses "required" as a key.

    // Using "required" as key will likeliy be OK in the future, if we manage to inteligently deduplicate
    // errors with a shared code. (eg, only display one error with code "required" per component)
    return true;
  }
  return false;
}

export function getValidationMessage(issue: IValidationIssue, langTools: IUseLanguage, params?: string[]): string {
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

export function mapValidationIssues(issues: IValidationIssue[]): IValidationObject[] {
  const state: IRuntimeState = window.reduxStore.getState();
  const nodes = resolvedLayoutsFromState(state);
  const langTools = staticUseLanguageFromState(state);

  if (!nodes) {
    return [];
  }

  const allNodes = nodes.allNodes().filter((node) => !node.isHidden() && !node.item.renderAsSummary);

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

      if (node.item.dataModelBindings) {
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
