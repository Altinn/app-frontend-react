import { type IUseLanguage, staticUseLanguageFromState } from 'src/hooks/useLanguage';
import { Severity, Triggers } from 'src/types';
import { resolvedLayoutsFromState } from 'src/utils/layout/hierarchy';
import { validationTexts } from 'src/utils/validation/validationTexts';
import type {
  IComponentValidationResult,
  IComponentValidations,
  ILayoutValidationResult,
  ILayoutValidations,
  IRuntimeState,
  IValidationIssue,
  IValidationResult,
  IValidations,
  TriggersPageValidation,
  ValidationSeverity,
} from 'src/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationMessage, IValidationObject } from 'src/utils/validation/types';

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
    empty: false,
    componentId: node.item.id,
    pageKey: node.pageKey(),
    bindingKey,
    severity,
    message,
    invalidDataTypes,
    rowIndices: node.getRowIndices(),
  };
}

export function emptyValidation(node: LayoutNode): IValidationObject {
  return {
    empty: true,
    componentId: node.item.id,
    pageKey: node.pageKey(),
    rowIndices: node.getRowIndices(),
  };
}

export function unmappedError(severity: ValidationSeverity, message: string): IValidationObject {
  return {
    empty: false,
    componentId: 'unmapped',
    pageKey: 'unmapped',
    bindingKey: 'unmapped',
    severity,
    message,
    invalidDataTypes: false,
    rowIndices: [],
  };
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

export function removeFixedValidations(validationObjects: IValidationObject[]): IValidationObject[] {
  const fixedValidations = validationObjects.filter(
    (f) => !f.empty && f.severity === 'fixed',
  ) as IValidationMessage<'fixed'>[];

  if (fixedValidations.length === 0) {
    return validationObjects;
  }

  return validationObjects.filter(
    (v) =>
      v.empty ||
      v.severity === 'fixed' ||
      !fixedValidations.find(
        (f) =>
          v.pageKey === f.pageKey &&
          v.componentId === f.componentId &&
          v.bindingKey === f.bindingKey &&
          v.message === f.message,
      ),
  );
}

export function containsErrors(validationObjects: IValidationObject[]): boolean {
  return removeFixedValidations(validationObjects).some(
    (o) => !o.empty && (o.severity === 'errors' || o.invalidDataTypes),
  );
}

export function hasInvalidDataTypes(validationObjects: IValidationObject[]): boolean {
  return removeFixedValidations(validationObjects).some((o) => !o.empty && o.invalidDataTypes);
}

// Preserves fixed validations
export function filterValidationObjectsByComponentId(validations: IValidationObject[], componentId: string) {
  return validations.filter((v) => v.componentId === componentId || (!v.empty && v.severity === 'fixed'));
}

// Preserves fixed validations
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
    return validations.filter((v) => previousPages.includes(v.pageKey) || (!v.empty && v.severity === 'fixed'));
  }

  if (trigger === Triggers.ValidatePage) {
    return validations.filter((v) => v.pageKey === currentView || (!v.empty && v.severity === 'fixed'));
  }

  return [];
}

// Preserves fixed validations
export function filterValidationObjectsByRowIndex(
  rowIndex: number,
  baseRowIndices: number[],
  validationObjects: IValidationObject[],
): IValidationObject[] {
  const filteredValidationObjects: IValidationObject[] = [];
  const rowIndicesToCompare = [...baseRowIndices, rowIndex];
  for (const o of validationObjects) {
    if (!o.empty && o.severity === 'fixed') {
      filteredValidationObjects.push(o);
      continue;
    }

    if (o.rowIndices.length < rowIndicesToCompare.length) {
      continue;
    }
    if (rowIndicesToCompare.every((index, i) => o.rowIndices[i] === index)) {
      filteredValidationObjects.push(o);
    }
  }
  return filteredValidationObjects;
}

/**
 * This function assumes that all validation outputs are for the same component. (except for fixed messages)
 */
export function createComponentValidations(
  validationOutputs: IValidationObject[],
): [IComponentValidations, IValidationMessage<'fixed'>[]] {
  if (validationOutputs.length === 0) {
    return [{}, []];
  }
  const componentValidations = {};
  const fixedValidations: IValidationMessage<'fixed'>[] = [];

  for (const output of validationOutputs) {
    if (output.empty) {
      continue;
    }

    if (output.severity === 'fixed') {
      fixedValidations.push(output);
      continue;
    }

    const { bindingKey, severity, message } = output;

    if (componentValidations[bindingKey]?.[severity] && !componentValidations[bindingKey][severity].includes(message)) {
      componentValidations[bindingKey][severity].push(message);
      continue;
    }
    if (componentValidations[bindingKey]) {
      componentValidations[bindingKey][severity] = [message];
      continue;
    }
    componentValidations[bindingKey] = { [severity]: [message] };
  }

  return [componentValidations, fixedValidations];
}

/**
 * This function assumes that all validation outputs are for the same layout. (except for fixed messages)
 */
export function createLayoutValidations(
  validationOutputs: IValidationObject[],
): [ILayoutValidations, IValidationMessage<'fixed'>[]] {
  if (validationOutputs.length === 0) {
    return [{}, []];
  }

  const layoutValidations = {};
  const fixedValidations: IValidationMessage<'fixed'>[] = [];

  for (const output of validationOutputs) {
    if (output.empty) {
      if (!layoutValidations[output.componentId]) {
        layoutValidations[output.componentId] = {};
      }
      continue;
    }

    if (output.severity === 'fixed') {
      fixedValidations.push(output);
      continue;
    }

    const { componentId, bindingKey, severity, message } = output;

    if (
      layoutValidations[componentId]?.[bindingKey]?.[severity] &&
      !layoutValidations[componentId][bindingKey][severity].includes(message)
    ) {
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
  return [layoutValidations, fixedValidations];
}

export function createValidations(
  validationOutputs: IValidationObject[],
): [IValidations, IValidationMessage<'fixed'>[]] {
  if (validationOutputs.length === 0) {
    return [{}, []];
  }

  const validations = {};
  const fixedValidations: IValidationMessage<'fixed'>[] = [];

  for (const output of validationOutputs) {
    if (output.empty) {
      if (!validations[output.pageKey]) {
        validations[output.pageKey] = { [output.componentId]: {} };
        continue;
      }
      if (!validations[output.pageKey][output.componentId]) {
        validations[output.pageKey][output.componentId] = {};
      }
      continue;
    }

    if (output.severity === 'fixed') {
      fixedValidations.push(output);
      continue;
    }

    const { pageKey, componentId, bindingKey, severity, message } = output;

    if (
      validations[pageKey]?.[componentId]?.[bindingKey]?.[severity] &&
      !validations[pageKey][componentId][bindingKey][severity].includes(message)
    ) {
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
  return [validations, fixedValidations];
}

export function createComponentValidationResult(validationOutputs: IValidationObject[]): IComponentValidationResult {
  const [validations, fixedValidations] = createComponentValidations(validationOutputs);
  const invalidDataTypes = hasInvalidDataTypes(validationOutputs);

  const result: IComponentValidationResult = {
    validations,
    invalidDataTypes,
    fixedValidations,
  };
  return result;
}

export function createLayoutValidationResult(validationOutputs: IValidationObject[]): ILayoutValidationResult {
  const [validations, fixedValidations] = createLayoutValidations(validationOutputs);
  const invalidDataTypes = hasInvalidDataTypes(validationOutputs);

  const result: ILayoutValidationResult = {
    validations,
    invalidDataTypes,
    fixedValidations,
  };
  return result;
}

export function createValidationResult(validationOutputs: IValidationObject[]): IValidationResult {
  const [validations, fixedValidations] = createValidations(validationOutputs);
  const invalidDataTypes = hasInvalidDataTypes(validationOutputs);

  const result: IValidationResult = {
    validations,
    invalidDataTypes,
    fixedValidations,
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
