import { ValidationMask } from 'src/features/validation';
import { implementsValidationFilter } from 'src/layout';
import type {
  AnyValidation,
  BaseValidation,
  FieldValidations,
  NodeValidation,
  ValidationContext,
  ValidationMaskKeys,
  ValidationSeverity,
  ValidationState,
} from 'src/features/validation';
import type { ValidationSelector } from 'src/features/validation/validationContext';
import type { ValidationsSelector } from 'src/features/validation/ValidationStorePlugin';
import type { CompInternal } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function mergeFieldValidations(...X: FieldValidations[]): FieldValidations {
  if (X.length === 0) {
    return {};
  }

  if (X.length === 1) {
    return X[0];
  }

  const [X1, ...XRest] = X;
  const out = structuredClone(X1);
  for (const Xn of XRest) {
    for (const [field, validations] of Object.entries(structuredClone(Xn))) {
      if (!out[field]) {
        out[field] = [];
      }
      out[field].push(...validations);
    }
  }
  return out;
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
  return validations?.some((validation: any) => validation.severity === 'error') ?? false;
}

/**
 * Filters a list of validations based on the validation filters of a node
 */
export function filterValidations<Validation extends BaseValidation>(
  validations: Validation[],
  node: LayoutNode,
): Validation[] {
  if (!implementsValidationFilter(node.def)) {
    return validations;
  }

  const filters = node.def.getValidationFilters(node as any);
  if (filters.length == 0) {
    return validations;
  }

  const out: Validation[] = [];
  validationsLoop: for (let i = 0; i < validations.length; i++) {
    for (const filter of filters) {
      if (!filter(validations[i], i, validations)) {
        // Skip validation if any filter returns false
        continue validationsLoop;
      }
    }
    out.push(validations[i]);
  }
  return out;
}

/**
 * This can be used in a filter to remove hidden nodes from consideration when checking for validation errors
 */
export function shouldValidateNode(node: LayoutNode): boolean {
  return !node.isHidden({ respectTracks: true }) && !('renderAsSummary' in node.item && node.item.renderAsSummary);
}

export function isValidationVisible<T extends BaseValidation>(validation: T, mask: number): boolean {
  if (validation.category === 0) {
    return true;
  }
  return (mask & validation.category) > 0;
}

export function selectValidations<T extends BaseValidation>(
  validations: T[],
  mask: number,
  severity?: ValidationSeverity,
) {
  const filteredValidations = severity ? validationsOfSeverity(validations, severity) : validations;
  return filteredValidations.filter((validation) => isValidationVisible(validation, mask));
}

export interface ValidationLookupSources {
  validationState: ValidationState | ValidationSelector;
  nodeValidationsSelector: ValidationsSelector;
}

/**
 * Gets all validations for a node in a single list, optionally filtered by severity
 * Looks at data model bindings to get field validations
 */
export function getValidationsForNode(
  node: LayoutNode,
  findIn: ValidationLookupSources,
  mask: number,
): NodeValidation[];
export function getValidationsForNode<Severity extends ValidationSeverity>(
  node: LayoutNode,
  findIn: ValidationLookupSources,
  mask: number,
  severity: Severity,
): NodeValidation<AnyValidation<Severity>>[];
export function getValidationsForNode(
  node: LayoutNode,
  findIn: ValidationLookupSources,
  mask: number,
  severity?: ValidationSeverity,
): NodeValidation[] {
  const validationMessages: NodeValidation[] = [];
  if (!shouldValidateNode(node)) {
    return validationMessages;
  }

  const selector: ValidationSelector = (cacheKey, selector) => {
    if (typeof findIn.validationState === 'function') {
      return findIn.validationState(cacheKey, selector);
    }
    return selector({ state: findIn.validationState } as ValidationContext);
  };

  if (node.item.dataModelBindings) {
    for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
      const fieldValidations = selector(`field-${field}`, (state) => state.state.fields[field]);
      if (fieldValidations) {
        const validations = filterValidations(selectValidations(fieldValidations, mask, severity), node);
        validationMessages.push(...validations.map((validation) => ({ ...validation, node, bindingKey })));
      }
    }
  }

  const componentValidations = findIn.nodeValidationsSelector(node);
  const validations = filterValidations(selectValidations(componentValidations, mask, severity), node);
  validationMessages.push(...validations.map((validation) => ({ ...validation, node })));

  return validationMessages;
}

/**
 * Gets the initial validation mask for a component using its showValidations property
 * If the value is not set, it will default to all validations except required
 */
export function getInitialMaskFromNode(item: CompInternal): number {
  // If not set, null, or undefined, default to all validations except required
  if (!('showValidations' in item) || item.showValidations == null) {
    return ValidationMask.AllExceptRequired;
  }
  return getVisibilityMask(item.showValidations);
}

export function getVisibilityMask(maskKeys?: ValidationMaskKeys[]): number {
  let mask = 0;
  if (!maskKeys) {
    return mask;
  }
  for (const maskKey of maskKeys) {
    mask |= ValidationMask[maskKey];
  }
  return mask;
}
