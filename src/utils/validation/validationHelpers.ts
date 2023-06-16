import { Severity, Triggers } from 'src/types';
import { resolvedLayoutsFromState } from 'src/utils/layout/hierarchy';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import { validationTexts } from 'src/utils/validation/validationTexts';
import type {
  IComponentValidationResult,
  IComponentValidations,
  ILayoutValidationResult,
  ILayoutValidations,
  IRuntimeState,
  ITextResource,
  IValidationIssue,
  IValidationResult,
  IValidations,
  TriggersPageValidation,
  ValidationSeverity,
} from 'src/types';
import type { ILanguage } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationObject } from 'src/utils/validation/types';

export const severityMap: { [s in Severity]: ValidationSeverity } = {
  [Severity.Error]: 'errors',
  [Severity.Warning]: 'warnings',
  [Severity.Informational]: 'info',
  [Severity.Success]: 'success',
  [Severity.Fixed]: 'fixed',
  [Severity.Unspecified]: 'unspecified',
};

export function buildValidationObject(
  node: LayoutNode,
  severity: ValidationSeverity,
  message: string,
  bindingKey = 'simpleBinding',
  invalidDataTypes = false,
): IValidationObject {
  return {
    componentId: node.item.id,
    pageKey: node.pageKey(),
    bindingKey,
    severity,
    message,
    invalidDataTypes,
    rowIndices: node.getRowIndices(),
  };
}

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

export function containsErrors(validationObjects: IValidationObject[]): boolean {
  return validationObjects.some(
    (validationObject) => validationObject.severity === 'errors' || validationObject.invalidDataTypes,
  );
}

export function filterValidationObjectsByPage(
  validations: IValidationObject[],
  trigger: TriggersPageValidation,
  currentView: string,
  pageOrder: string[],
): IValidationObject[] {
  if (trigger === Triggers.ValidateAllPages) {
    return validations;
  }

  if (trigger === Triggers.ValidateCurrentAndPreviousPages) {
    const index = pageOrder.indexOf(currentView);
    const previousPages = pageOrder.slice(0, index + 1);
    return validations.filter(({ pageKey }) => previousPages.includes(pageKey));
  }

  if (trigger === Triggers.ValidatePage) {
    return validations.filter(({ pageKey }) => pageKey === currentView);
  }

  return [];
}

export function filterValidationObjectsByRowIndex(
  rowIndex: number,
  baseRowIndices: number[],
  validationObjects: IValidationObject[],
): IValidationObject[] {
  const filteredValidationObjects: IValidationObject[] = [];
  const rowIndicesToCompare = [...baseRowIndices, rowIndex];
  for (const object of validationObjects) {
    if (object.rowIndices.length < rowIndicesToCompare.length) {
      continue;
    }
    if (rowIndicesToCompare.every((index, i) => object.rowIndices[i] === index)) {
      filteredValidationObjects.push(object);
    }
  }
  return filteredValidationObjects;
}

/**
 * This is a temprorary function to convert the old validation format to the new one.
 */
export function componentValidationToValidationObjects(
  node: LayoutNode,
  componentValidations: IComponentValidations,
  invalidDataTypes = false,
): IValidationObject[] {
  const validationObjects: IValidationObject[] = [];
  const bindingKeys = Object.keys(componentValidations ?? {});
  for (const bindingKey of bindingKeys) {
    const severities = Object.keys(componentValidations[bindingKey] ?? {}) as ValidationSeverity[];
    for (const severity of severities) {
      const messages = componentValidations[bindingKey]?.[severity] ?? [];
      for (const message of messages) {
        validationObjects.push({
          componentId: node.item.id,
          pageKey: node.pageKey(),
          bindingKey,
          severity,
          message,
          invalidDataTypes,
          rowIndices: node.getRowIndices(),
        });
      }
    }
  }
  return validationObjects;
}

/**
 * This function assumes that all validation outputs are for the same component.
 */
export function createComponentValidations(validationOutputs: IValidationObject[]): IComponentValidations {
  if (validationOutputs.length === 0) {
    return {};
  }
  const componentValidations = {};

  for (const output of validationOutputs) {
    const { bindingKey, severity, message } = output;

    if (componentValidations[bindingKey]?.[severity]) {
      componentValidations[bindingKey][severity].push(message);
      continue;
    }
    if (componentValidations[bindingKey]) {
      componentValidations[bindingKey][severity] = [message];
      continue;
    }
    componentValidations[bindingKey] = { [severity]: [message] };
  }

  return componentValidations;
}

/**
 * This function assumes that all validation outputs are for the same layout.
 */
export function createLayoutValidations(validationOutputs: IValidationObject[]): ILayoutValidations {
  if (validationOutputs.length === 0) {
    return {};
  }

  const layoutValidations = {};
  for (const output of validationOutputs) {
    const { componentId, bindingKey, severity, message } = output;

    if (layoutValidations[componentId]?.[bindingKey]?.[severity]) {
      layoutValidations[componentId][bindingKey][severity].push(message);
      continue;
    }
    if (layoutValidations[componentId]?.[bindingKey]) {
      layoutValidations[componentId][bindingKey][severity] = [message];
      continue;
    }
    if (layoutValidations[componentId]) {
      layoutValidations[componentId][bindingKey] = { [severity]: [message] };
      continue;
    }
    layoutValidations[componentId] = { [bindingKey]: { [severity]: [message] } };
  }
  return layoutValidations;
}

export function createValidations(validationOutputs: IValidationObject[]): IValidations {
  if (validationOutputs.length === 0) {
    return {};
  }

  const validations = {};
  for (const output of validationOutputs) {
    const { pageKey, componentId, bindingKey, severity, message } = output;

    if (validations[pageKey]?.[componentId]?.[bindingKey]?.[severity]) {
      validations[pageKey][componentId][bindingKey][severity].push(message);
      continue;
    }
    if (validations[pageKey]?.[componentId]?.[bindingKey]) {
      validations[pageKey][componentId][bindingKey][severity] = [message];
      continue;
    }
    if (validations[pageKey]?.[componentId]) {
      validations[pageKey][componentId][bindingKey] = { [severity]: [message] };
      continue;
    }
    if (validations[pageKey]) {
      validations[pageKey][componentId] = { [bindingKey]: { [severity]: [message] } };
      continue;
    }
    validations[pageKey] = { [componentId]: { [bindingKey]: { [severity]: [message] } } };
  }
  return validations;
}

export function createComponentValidationResult(validationOutputs: IValidationObject[]): IComponentValidationResult {
  const validations = createComponentValidations(validationOutputs);
  const invalidDataTypes = validationOutputs.some((output) => output.invalidDataTypes);

  const result: IComponentValidationResult = {
    validations,
    invalidDataTypes,
  };
  return result;
}

export function createLayoutValidationResult(validationOutputs: IValidationObject[]): ILayoutValidationResult {
  const validations = createLayoutValidations(validationOutputs);
  const invalidDataTypes = validationOutputs.some((output) => output.invalidDataTypes);

  const result: ILayoutValidationResult = {
    validations,
    invalidDataTypes,
  };
  return result;
}

export function createValidationResult(validationOutputs: IValidationObject[]): IValidationResult {
  const validations = createValidations(validationOutputs);
  const invalidDataTypes = validationOutputs.some((output) => output.invalidDataTypes);

  const result: IValidationResult = {
    validations,
    invalidDataTypes,
  };
  return result;
}

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

export function mapValidationIssues(issues: IValidationIssue[]): IValidationObject[] {
  const state: IRuntimeState = window.reduxStore.getState();
  const nodes = resolvedLayoutsFromState(state);
  const language = state.language.language ?? {};
  const textResources = state.textResources.resources;

  if (!nodes) {
    return [];
  }

  const allNodes = nodes.allNodes().filter((node) => !node.isHidden()); // TODO Should hidden components be excluded?

  const validationOutputs: IValidationObject[] = [];
  for (const issue of issues) {
    if (shouldExcludeValidationIssue(issue)) {
      continue;
    }

    const { field, severity } = issue;
    const message = getValidationMessage(issue, textResources, language);

    for (const node of allNodes) {
      // Special case for FileUpload and FileUploadWithTag
      if ((node.isType('FileUpload') || node.isType('FileUploadWithTag')) && node.item.id === issue.field) {
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
