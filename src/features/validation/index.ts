import type {
  ComponentValidation,
  FieldValidation,
  FormValidations,
  NodeValidation,
  ValidationState,
} from 'src/features/validation/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { ValidationSeverity } from 'src/utils/validation/types';

export enum FrontendValidationSource {
  EmptyField = '__empty_field__',
  Schema = '__schema__',
  Component = '__component__',
  Expression = '__expression__',
}

export function isFieldValidation(validation: ComponentValidation | FieldValidation): validation is FieldValidation {
  return 'field' in validation;
}

export function isComponentValidation(
  validation: ComponentValidation | FieldValidation,
): validation is ComponentValidation {
  return 'componentId' in validation;
}

export function mergeFormValidations(dest: FormValidations | ValidationState, src: FormValidations | ValidationState) {
  for (const [field, groups] of Object.entries(src.fields)) {
    if (!dest.fields[field]) {
      dest.fields[field] = {};
    }
    for (const [group, validations] of Object.entries(groups)) {
      dest.fields[field][group] = validations;
    }
  }

  for (const [componentId, compValidations] of Object.entries(src.components)) {
    if (!dest.components[componentId]) {
      dest.components[componentId] = {
        bindingKeys: {},
        component: {},
      };
    }

    if (compValidations.component) {
      for (const [group, validations] of Object.entries(compValidations.component)) {
        dest.components[componentId].component[group] = validations;
      }
    }

    if (compValidations.bindingKeys) {
      for (const [bindingKey, groups] of Object.entries(compValidations.bindingKeys)) {
        if (!dest.components[componentId].bindingKeys[bindingKey]) {
          dest.components[componentId].bindingKeys[bindingKey] = {};
        }
        for (const [group, validations] of Object.entries(groups)) {
          dest.components[componentId].bindingKeys[bindingKey][group] = validations;
        }
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

/*
 * Gets all validations for a node in a single list, optionally filtered by severity
 * Looks at data model bindings to get field validations
 */
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
      if (state.fields[field]) {
        for (const group of Object.values(state.fields[field])) {
          const groupValidations = severity ? validationsOfSeverity(group, severity) : group;
          for (const validation of groupValidations) {
            validationMessages.push(buildNodeValidation(node, validation, bindingKey));
          }
        }
      }

      if (state.components[node.item.id]?.bindingKeys?.[bindingKey]) {
        for (const group of Object.values(state.components[node.item.id].bindingKeys[bindingKey])) {
          const groupValidations = severity ? validationsOfSeverity(group, severity) : group;
          for (const validation of groupValidations) {
            validationMessages.push(buildNodeValidation(node, validation, bindingKey));
          }
        }
      }
    }
  }
  if (state.components[node.item.id]?.component) {
    for (const group of Object.values(state.components[node.item.id].component)) {
      const groupValidations = severity ? validationsOfSeverity(group, severity) : group;
      for (const validation of groupValidations) {
        validationMessages.push(buildNodeValidation(node, validation));
      }
    }
  }
  return validationMessages;
}
