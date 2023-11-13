import type {
  ComponentValidation,
  FieldValidation,
  FormValidations,
  GroupedValidation,
  NodeValidation,
  ValidationState,
} from 'src/features/validation/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ValidationSeverity } from 'src/utils/validation/types';

export enum FrontendValidationSource {
  Required = '__required__',
  Schema = '__schema__',
  Component = '__component__',
  Expression = '__expression__',
}

/**
 * Initializes a validation group for a field
 * This must be done for all fields that will be validated
 * before adding any validations to it.
 */
export function initializeFieldValidations(dest: FormValidations, field: string, group: string): void {
  if (dest.fields?.[field]?.[group]) {
    window.logError(
      `Initializing validation failed, group ${group} already exists on field ${field}\n`,
      dest.fields[field][group],
    );
    return;
  }

  if (!dest.fields) {
    dest.fields = { [field]: { [group]: [] } };
  } else if (!dest.fields[field]) {
    dest.fields[field] = { [group]: [] };
  } else {
    dest.fields[field][group] = [];
  }
}

/**
 * Initializes a validation group for a component
 * This must be done for all components that will be validated
 * before adding any validations to it.
 */
export function initializeComponentValidations(dest: FormValidations, componentId: string, group: string): void {
  if (dest.components?.[componentId]?.[group]) {
    window.logError(
      `Initializing validation failed, group ${group} already exists on field ${componentId}\n`,
      dest.components[componentId][group],
    );
    return;
  }

  if (!dest.components) {
    dest.components = { [componentId]: { [group]: [] } };
  } else if (!dest.components[componentId]) {
    dest.components[componentId] = { [group]: [] };
  } else {
    dest.components[componentId][group] = [];
  }
}

function isFieldValidation(validation: GroupedValidation): validation is FieldValidation {
  return 'field' in validation;
}

function isComponentValidation(validation: GroupedValidation): validation is ComponentValidation {
  return 'componentId' in validation;
}

/**
 * Adds a validation to a fieldValidations object
 * Logs a warning if field and group are not found,
 * as these will need to be initialized as empty in order
 * to be able to remove the validation in case it does not return an error.
 */
export function addValidation<T extends GroupedValidation>(dest: FormValidations, validation: T): void {
  if (isFieldValidation(validation)) {
    if (!dest.fields?.[validation.field]) {
      window.logError('Adding validation failed, field object was not initialized\n', validation);
      return;
    }

    if (!dest.fields?.[validation.field][validation.group]) {
      window.logError('Adding validation failed, group object was not initialized\n', validation);
      return;
    }

    dest.fields[validation.field][validation.group].push(validation);
  } else if (isComponentValidation(validation)) {
    if (!dest.components?.[validation.componentId]) {
      window.logError('Adding validation failed, componentId object was not initialized\n', validation);
      return;
    }

    if (!dest.components?.[validation.componentId][validation.group]) {
      window.logError('Adding validation failed, group object was not initialized\n', validation);
      return;
    }

    dest.components[validation.componentId][validation.group].push(validation);
  } else {
    window.logError('Adding validation failed, validation was not of a known type\n', validation);
  }
}

export function mergeFormValidations(dest: FormValidations, src: FormValidations) {
  if (src.fields) {
    if (!dest.fields) {
      dest.fields = {};
    }
    for (const [field, groups] of Object.entries(src.fields)) {
      if (!dest.fields[field]) {
        dest.fields[field] = {};
      }
      for (const [group, validations] of Object.entries(groups)) {
        dest.fields[field][group] = validations;
      }
    }
  }

  if (src.components) {
    if (!dest.components) {
      dest.components = {};
    }
    for (const [componentId, groups] of Object.entries(src.components)) {
      if (!dest.components[componentId]) {
        dest.components[componentId] = {};
      }
      for (const [group, validations] of Object.entries(groups)) {
        dest.components[componentId][group] = validations;
      }
    }
  }
}

export function validationsOfSeverity<Severity extends ValidationSeverity>(
  validations: NodeValidation<ValidationSeverity>[] | undefined,
  severity: Severity,
): NodeValidation<Severity>[];
export function validationsOfSeverity<Severity extends ValidationSeverity>(
  validations: ComponentValidation<ValidationSeverity>[] | undefined,
  severity: Severity,
): ComponentValidation<Severity>[];
export function validationsOfSeverity<Severity extends ValidationSeverity>(
  validations: FieldValidation<ValidationSeverity>[] | undefined,
  severity: Severity,
): FieldValidation<Severity>[];
export function validationsOfSeverity(validations: any, severity: any) {
  return validations?.filter((validation: any) => validation.severity === severity) ?? [];
}

export function hasValidationErrors(validations: NodeValidation<ValidationSeverity>[] | undefined): boolean;
export function hasValidationErrors(validations: FieldValidation<ValidationSeverity>[] | undefined): boolean;
export function hasValidationErrors(validations: any): boolean {
  return validations?.some((validation: any) => validation.severity === 'errors') ?? false;
}

export function buildNodeValidation<Severity extends ValidationSeverity = ValidationSeverity>(
  node: LayoutNode,
  validation: FieldValidation<Severity> | ComponentValidation<Severity>,
  bindingKey?: string,
): NodeValidation<Severity> {
  return {
    ...validation,
    bindingKey,
    componentId: node.item.id,
    pageKey: node.pageKey(),
  };
}
export function getValidationsForNode(node: LayoutNode, state: ValidationState): NodeValidation[];
export function getValidationsForNode<Severity extends ValidationSeverity>(
  node: LayoutNode,
  state: ValidationState,
  severity: Severity,
): NodeValidation<Severity>[];
export function getValidationsForNode(
  node: LayoutNode,
  state: ValidationState,
  severity?: ValidationSeverity,
): NodeValidation[] {
  const validationMessages: NodeValidation[] = [];
  if (node.item.dataModelBindings) {
    for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
      if (!state.fields[field]) {
        continue;
      }
      for (const group of Object.values(state.fields[field])) {
        const groupValidations = severity ? validationsOfSeverity(group, severity) : group;
        for (const validation of groupValidations) {
          validationMessages.push(buildNodeValidation(node, validation, bindingKey));
        }
      }
    }
  }
  if (state.components[node.item.id]) {
    for (const group of Object.values(state.components[node.item.id])) {
      for (const validation of group) {
        validationMessages.push(buildNodeValidation(node, validation));
      }
    }
  }
  return validationMessages;
}
