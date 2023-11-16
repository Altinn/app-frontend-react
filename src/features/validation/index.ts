import { useEffect, useRef } from 'react';

import deepEqual from 'fast-deep-equal';

import { useExprContext } from 'src/utils/layout/ExprContext';
import { ValidationIssueSources } from 'src/utils/validation/backendValidation';
import type { IFormData } from 'src/features/formData';
import type {
  BaseValidation,
  ComponentValidation,
  FieldValidation,
  FormValidations,
  GroupedValidation,
  NodeValidation,
  ValidationGroup,
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

function isOfSeverity<V extends BaseValidation, S extends ValidationSeverity>(severity: S) {
  return (validation: V): validation is V & { severity: S } => validation.severity === severity;
}
export function validationsOfSeverity<I extends BaseValidation, S extends ValidationSeverity>(
  validations: I[] | undefined,
  severity: S,
) {
  return validations?.filter(isOfSeverity(severity)) ?? [];
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
  ignoreBackendValidations: boolean,
  severity?: ValidationSeverity,
) {
  const validationsFlat = ignoreBackendValidations
    ? Object.entries(groups)
        .filter(([group]) => !groupsToFilter.includes(group))
        .flatMap(([, validations]) => validations)
    : Object.values(groups).flat();

  return severity ? validationsOfSeverity(validationsFlat, severity) : validationsFlat;
}

/*
 * Gets all validations for a node in a single list, optionally filtered by severity
 * Looks at data model bindings to get field validations
 */
export function getValidationsForNode(
  node: LayoutNode,
  state: ValidationState,
  ignoreBackendValidations: boolean,
): NodeValidation[];
export function getValidationsForNode<Severity extends ValidationSeverity>(
  node: LayoutNode,
  state: ValidationState,
  ignoreBackendValidations: boolean,
  severity: Severity,
): NodeValidation<Severity>[];
export function getValidationsForNode(
  node: LayoutNode,
  state: ValidationState,
  ignoreBackendValidations = true,
  severity?: ValidationSeverity,
): NodeValidation[] {
  const validationMessages: NodeValidation[] = [];
  if (node.item.dataModelBindings) {
    for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
      if (state.fields[field]) {
        const validations = validationsFromGroups(state.fields[field], ignoreBackendValidations, severity);
        for (const validation of validations) {
          validationMessages.push(buildNodeValidation(node, validation, bindingKey));
        }
      }

      if (state.components[node.item.id]?.bindingKeys?.[bindingKey]) {
        const validations = validationsFromGroups(
          state.components[node.item.id].bindingKeys[bindingKey],
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
      ignoreBackendValidations,
      severity,
    );
    for (const validation of validations) {
      validationMessages.push(buildNodeValidation(node, validation));
    }
  }
  return validationMessages;
}

/**
 * Provides a callback function with added/removed nodes when the hierarchy changes
 */
export function useOnHierarchyChange(
  onChange: (addedNodeChanges: NodeDataChange[], removedNodes: LayoutNode[], currentNodes: LayoutNode[]) => void,
) {
  const layoutNodes = useExprContext();
  const lastNodes = useRef<LayoutNode[]>([]);

  useEffect(() => {
    const prevNodes = lastNodes.current;
    const newNodes = layoutNodes?.allNodes() ?? [];
    if (
      !deepEqual(
        prevNodes.map((n) => n.item.id),
        newNodes.map((n) => n.item.id),
      )
    ) {
      lastNodes.current = newNodes;

      const addedNodes = newNodes
        .filter((n) => !prevNodes.find((pn) => pn.item.id === n.item.id))
        .map((n) => ({
          node: n,
          fields: n.item.dataModelBindings ? Object.values(n.item.dataModelBindings) : [],
        }));
      const removedNodes = prevNodes.filter((pn) => !newNodes.find((n) => pn.item.id === n.item.id));
      onChange(addedNodes, removedNodes, newNodes);
    }
  }, [layoutNodes, onChange]);
}

export type NodeDataChange = {
  node: LayoutNode;
  fields: string[];
};
/**
 * Provides a callback function with a list of nodes whoes data has changed
 */
export function useOnNodeDataChange(onChange: (nodeChanges: NodeDataChange[]) => void) {
  const layoutNodes = useExprContext();
  const lastNodeData = useRef<{ [id: string]: LayoutNode }>({});

  useEffect(() => {
    const prevNodes = lastNodeData.current;
    const newNodes: { [id: string]: LayoutNode } =
      layoutNodes?.allNodes().reduce((data, node) => ({ ...data, [node.item.id]: node }), {}) ?? {};

    // Update if nodes have been added or removed
    let shouldUpdate = !deepEqual(Object.keys(newNodes), Object.keys(prevNodes));

    const updatedNodes: NodeDataChange[] = [];
    for (const [id, newNode] of Object.entries(newNodes)) {
      const prevNode = prevNodes[id];
      if (!prevNode) {
        continue;
      }
      const changes = getChangedFields(newNode.getFieldFormData(), prevNode.getFieldFormData());
      if (changes.length) {
        shouldUpdate = true;
        updatedNodes.push({
          node: newNode,
          fields: changes,
        });
      }
    }
    if (shouldUpdate) {
      lastNodeData.current = newNodes;
    }
    if (updatedNodes.length) {
      onChange(updatedNodes);
    }
  }, [layoutNodes, onChange]);
}

function getChangedFields(current: IFormData, prev: IFormData) {
  const changes: string[] = [];
  for (const field of Object.keys(current)) {
    if (current[field] !== prev[field]) {
      changes.push(field);
    }
  }
  for (const field of Object.keys(prev)) {
    if (!(field in current)) {
      changes.push(field);
    }
  }

  return changes;
}
