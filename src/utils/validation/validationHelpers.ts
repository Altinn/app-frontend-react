import { getTextFromAppOrDefault } from 'src/utils/textResource';
import { mergeComponentValidations } from 'src/utils/validation/validation';
import { validationTexts } from 'src/utils/validation/validationTexts';
import type { ILayoutValidations, ITextResource, IValidationIssue, IValidationResult, IValidations } from 'src/types';
import type { ILanguage } from 'src/types/shared';
import type { IValidationOutput } from 'src/utils/validation/types';

export function getValidationMessage(
  issue: IValidationIssue,
  textResources: ITextResource[],
  language: ILanguage,
  params?: string[],
): string {
  if (issue.customTextKey) {
    return getTextFromAppOrDefault(issue.customTextKey, textResources, language, params, true);
  }

  if (issue.source && issue.code) {
    const resource = validationTexts[issue.source]?.[issue.code];
    if (resource) {
      return getTextFromAppOrDefault(resource, textResources, language, params, true);
    }
  }

  // Fallback to old behvaior if source not set.
  const legacyText = getTextFromAppOrDefault(issue.code, textResources, language, params, true);
  if (legacyText !== issue.code) {
    return legacyText;
  }

  return issue.source ? `${issue.source}.${issue.code}` : issue.code;
}

export function createLayoutValidations(validationOutputs: IValidationOutput[]): ILayoutValidations {
  const layoutValidations: ILayoutValidations = {};
  for (const output of validationOutputs) {
    const { componentId, validations } = output;
    if (layoutValidations[componentId]) {
      layoutValidations[componentId] = mergeComponentValidations(layoutValidations[componentId], validations);
      continue;
    }
    layoutValidations[componentId] = validations;
  }
  return layoutValidations;
}

export function createValidations(validationOutputs: IValidationOutput[]): IValidations {
  const allValidations: IValidations = {};
  for (const output of validationOutputs) {
    const { pageKey, componentId, validations } = output;
    if (allValidations[pageKey]?.[componentId]) {
      allValidations[pageKey][componentId] = mergeComponentValidations(
        allValidations[pageKey][componentId],
        validations,
      );
      continue;
    }
    if (allValidations[pageKey]) {
      allValidations[pageKey][componentId] = validations;
      continue;
    }
    allValidations[pageKey] = { [componentId]: validations };
  }
  return allValidations;
}

export function createValidationResult(validationOutputs: IValidationOutput[]): IValidationResult {
  const validations = createValidations(validationOutputs);
  const invalidDataTypes = validationOutputs.some((output) => output.invalidDataTypes);

  const result: IValidationResult = {
    validations,
    invalidDataTypes,
  };
  return result;
}

/**
 * This function assumes that all validation outputs are for the same component.
 */
export function mergeValidationOutputs(...validationOutputs: IValidationOutput[]): IValidationOutput {
  if (validationOutputs.length === 0) {
    throw new Error('No validation outputs to merge');
  }

  if (validationOutputs.length === 1) {
    return validationOutputs[0];
  }

  const { pageKey, componentId } = validationOutputs[0];
  const invalidDataTypes = validationOutputs.some((output) => output.invalidDataTypes);
  const validations = validationOutputs[0].validations;
  for (let i = 1; i < validationOutputs.length; i++) {
    validations[componentId] = mergeComponentValidations(validations, validationOutputs[i].validations);
  }
  const mergedOutput: IValidationOutput = {
    pageKey,
    componentId,
    validations,
    invalidDataTypes,
  };
  return mergedOutput;
}
