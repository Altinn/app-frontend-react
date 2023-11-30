import { ValidationIssueSources } from 'src/features/validation';
import type { IAttachments, UploadedAttachment } from 'src/features/attachments';
import type {
  BaseValidation,
  ComponentValidation,
  FieldValidation,
  FormValidations,
  GroupedValidation,
  NodeValidation,
  ValidationGroup,
  ValidationSeverity,
  ValidationState,
  ValidationUrgency,
} from 'src/features/validation';
import type { CompInternal } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

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

function isOfSeverity<V extends BaseValidation, S extends ValidationSeverity>(severity: S) {
  return (validation: V): validation is V & { severity: S } => validation.severity === severity;
}
export function validationsOfSeverity<I extends BaseValidation, S extends ValidationSeverity>(
  validations: I[] | undefined,
  severity: S,
) {
  return validations?.filter(isOfSeverity(severity)) ?? [];
}

export function hasValidationErrors<V extends BaseValidation>(validations: V[] | undefined): boolean {
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

/**
 * This can be used in a filter to remove hidden nodes from consideration when checking for validation errors
 */
export function shouldValidateNode(node: LayoutNode) {
  return !node.isHidden({ respectTracks: true }) && !('renderAsSummary' in node.item && node.item.renderAsSummary);
}

/**
 * The following types of validation are also handeled by the frontend
 * and should normally be filtered out to avoid showing duplicate messages.
 */
const groupsToFilter: string[] = [
  ValidationIssueSources.Required,
  ValidationIssueSources.ModelState,
  ValidationIssueSources.Expression,
];
export function validationsFromGroups<T extends GroupedValidation>(
  groups: ValidationGroup<T>,
  urgency: ValidationUrgency,
  ignoreBackendValidations: boolean,
  severity?: ValidationSeverity,
) {
  const validationsFlat = ignoreBackendValidations
    ? Object.entries(groups)
        .filter(([group]) => !groupsToFilter.includes(group))
        .flatMap(([, validations]) => validations)
    : Object.values(groups).flat();

  const filteredValidations = severity ? validationsOfSeverity(validationsFlat, severity) : validationsFlat;
  return filteredValidations.filter((validation) => urgency >= validation.urgency);
}

/*
 * Gets all validations for a node in a single list, optionally filtered by severity
 * Looks at data model bindings to get field validations
 */
export function getValidationsForNode(
  node: LayoutNode,
  state: ValidationState,
  urgency: ValidationUrgency,
  ignoreBackendValidations: boolean,
): NodeValidation[];
export function getValidationsForNode<Severity extends ValidationSeverity>(
  node: LayoutNode,
  state: ValidationState,
  urgency: ValidationUrgency,
  ignoreBackendValidations: boolean,
  severity: Severity,
): NodeValidation<Severity>[];
export function getValidationsForNode(
  node: LayoutNode,
  state: ValidationState,
  urgency: ValidationUrgency,
  ignoreBackendValidations = true,
  severity?: ValidationSeverity,
): NodeValidation[] {
  const validationMessages: NodeValidation[] = [];
  if (!shouldValidateNode(node)) {
    return validationMessages;
  }

  if (node.item.dataModelBindings) {
    for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
      if (state.fields[field]) {
        const validations = validationsFromGroups(state.fields[field], urgency, ignoreBackendValidations, severity);
        for (const validation of validations) {
          validationMessages.push(buildNodeValidation(node, validation, bindingKey));
        }
      }

      if (state.components[node.item.id]?.bindingKeys?.[bindingKey]) {
        const validations = validationsFromGroups(
          state.components[node.item.id].bindingKeys[bindingKey],
          urgency,
          ignoreBackendValidations,
          severity,
        );
        for (const validation of validations) {
          validationMessages.push(buildNodeValidation(node, validation, bindingKey));
        }
      }
    }
  }
  if (state.components[node.item.id]?.component) {
    const validations = validationsFromGroups(
      state.components[node.item.id].component,
      urgency,
      ignoreBackendValidations,
      severity,
    );
    for (const validation of validations) {
      validationMessages.push(buildNodeValidation(node, validation));
    }
  }
  return validationMessages;
}

export function attachmentsValid(
  attachments: IAttachments,
  component: CompInternal<'FileUpload' | 'FileUploadWithTag'>,
): boolean {
  if (component.minNumberOfAttachments === 0) {
    return true;
  }

  const attachmentsForComponent = attachments[component.id];
  if (!attachmentsForComponent) {
    return false;
  }

  return attachmentsForComponent.length >= component.minNumberOfAttachments;
}

export function attachmentIsMissingTag(attachment: UploadedAttachment): boolean {
  return attachment.data.tags === undefined || attachment.data.tags.length === 0;
}
