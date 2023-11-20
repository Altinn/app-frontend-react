import React, { useMemo } from 'react';

import { useImmer } from 'use-immer';

import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { runServerValidations } from 'src/features/validation/backend/runServerValidation';
import { runValidationOnNodes } from 'src/features/validation/frontend/runValidations';
import {
  useOnAttachmentsChange,
  useOnHierarchyChange,
  useOnNodeDataChange,
  useValidationContextGenerator,
} from 'src/features/validation/hooks';
import {
  buildNodeValidation,
  getValidationsForNode,
  mergeFormValidations,
  validationsFromGroups,
  validationsOfSeverity,
} from 'src/features/validation/utils';
import { useLanguage } from 'src/hooks/useLanguage';
import { createStrictContext } from 'src/utils/createContext';
import { useExprContext } from 'src/utils/layout/ExprContext';
import { getDataValidationUrl } from 'src/utils/urls/appUrlHelper';
import type { BaseValidation, NodeValidation, ValidationContext, ValidationState } from 'src/features/validation';
import type { CompTypes, IDataModelBindings } from 'src/layout/layout';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

const { Provider, useCtx } = createStrictContext<ValidationContext>({ name: 'ValidationContext' });

export function ValidationProvider({ children }) {
  const validationContextGenerator = useValidationContextGenerator();
  const langTools = useLanguage();
  const instanceId = useLaxInstance()?.instanceId;
  const currentDataElementId = useCurrentDataModelGuid();
  const validationUrl =
    instanceId?.length && currentDataElementId?.length
      ? getDataValidationUrl(instanceId, currentDataElementId)
      : undefined;

  const [validations, setValidations] = useImmer<ValidationState>({ fields: {}, components: {}, task: [] });

  useOnNodeDataChange(async (nodeChanges) => {
    const changedNodes = nodeChanges.map((nC) => nC.node);
    const serverValidations = await runServerValidations(nodeChanges, validationUrl, langTools);
    const newValidations = runValidationOnNodes(changedNodes, validationContextGenerator);
    setValidations((state) => {
      mergeFormValidations(state, newValidations);
      updateValidationState(state, serverValidations);
    });
  });

  useOnHierarchyChange(async (addedNodeChanges, removedNodes, currentNodes) => {
    const addedNodes = addedNodeChanges.map((nC) => nC.node);
    const serverValidations = await runServerValidations(addedNodeChanges, validationUrl, langTools);
    const newValidations = runValidationOnNodes(addedNodes, validationContextGenerator);
    setValidations((state) => {
      purgeValidationsForNodes(state, removedNodes, currentNodes);
      mergeFormValidations(state, newValidations);
      updateValidationState(state, serverValidations);
    });
  });

  useOnAttachmentsChange((changedNodes) => {
    const newValidations = runValidationOnNodes(changedNodes, validationContextGenerator);
    setValidations((state) => {
      mergeFormValidations(state, newValidations);
    });
  });

  const out = {
    state: validations,
  };

  return <Provider value={out}>{children}</Provider>;
}

/**
 * Returns all validation messages for a given node.
 * Both validations connected to specific data model bindings,
 * and general component validations in a single list.
 */
export function useUnifiedValidationsForNode(
  node: LayoutNode | undefined,
  ignoreBackendValidations = true,
): NodeValidation[] {
  const state = useCtx().state;

  return useMemo(
    () => (node ? getValidationsForNode(node, state, ignoreBackendValidations) : []),
    [ignoreBackendValidations, node, state],
  );
}

/**
 * Returns all validation messages for a nodes children and optionally the node itself.
 */
export function useDeepValidationsForNode(
  node: LayoutNode | undefined,
  onlyChildren: boolean = false,
  onlyInRowIndex?: number,
  ignoreBackendValidations = true,
): NodeValidation[] {
  const state = useCtx().state;
  return useMemo(() => {
    if (!node) {
      return [];
    }
    const nodesToValidate = onlyChildren ? node.flat(true, onlyInRowIndex) : [node, ...node.flat(true, onlyInRowIndex)];
    return nodesToValidate.flatMap((node) => getValidationsForNode(node, state, ignoreBackendValidations));
  }, [ignoreBackendValidations, node, onlyChildren, onlyInRowIndex, state]);
}

/**
 * Gets all validations that are bound to a data model field,
 * including component validations which have a binding key association.
 */
export function useBindingValidationsForNode<
  N extends LayoutNode,
  T extends CompTypes = N extends BaseLayoutNode<any, infer T> ? T : never,
>(
  node: N,
  ignoreBackendValidations = true,
): { [binding in keyof NonNullable<IDataModelBindings<T>>]: NodeValidation[] } | undefined {
  const state = useCtx().state;
  const fields = state.fields;
  const component = state.components[node.item.id];

  return useMemo(() => {
    if (!node.item.dataModelBindings) {
      return undefined;
    }
    const bindingValidations = {};
    for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
      bindingValidations[bindingKey] = [];

      if (fields[field]) {
        const validations = validationsFromGroups(fields[field], ignoreBackendValidations);
        bindingValidations[bindingKey].push(
          ...validations.map((validation) => buildNodeValidation(node, validation, bindingKey)),
        );
      }
      if (component?.bindingKeys?.[bindingKey]) {
        const validations = validationsFromGroups(component.bindingKeys[bindingKey], ignoreBackendValidations);
        bindingValidations[bindingKey].push(
          ...validations.map((validation) => buildNodeValidation(node, validation, bindingKey)),
        );
      }
    }
    return bindingValidations as { [binding in keyof NonNullable<IDataModelBindings<T>>]: NodeValidation[] };
  }, [node, fields, component.bindingKeys, ignoreBackendValidations]);
}

/**
 * Get only the component validations which are not bound to any data model fields.
 */
export function useComponentValidationsForNode(node: LayoutNode, ignoreBackendValidations = true): NodeValidation[] {
  const component = useCtx().state.components[node.item.id];
  return useMemo(() => {
    if (!component?.component) {
      return [];
    }
    const validations = validationsFromGroups(component.component!, ignoreBackendValidations);
    return validations.map((validation) => buildNodeValidation(node, validation));
  }, [component.component, ignoreBackendValidations, node]);
}

/**
 * Returns all validation errors (not warnings, info, etc.) for a given page.
 */
export function usePageErrors(page: LayoutPage, ignoreBackendValidations = true): NodeValidation<'errors'>[] {
  const state = useCtx().state;

  return useMemo(() => {
    const validationMessages: NodeValidation<'errors'>[] = [];

    for (const node of page.flat(true).filter((node) => !node.isHidden({ respectTracks: true }))) {
      validationMessages.push(...getValidationsForNode(node, state, ignoreBackendValidations, 'errors'));
    }

    return validationMessages;
  }, [ignoreBackendValidations, page, state]);
}

/**
 * Returns all validation errors (not warnings, info, etc.) for a layout set.
 * This includes unmapped/task errors as well
 */
export function useTaskErrors(ignoreBackendValidations = true): {
  formErrors: NodeValidation<'errors'>[];
  taskErrors: BaseValidation<'errors'>[];
} {
  const pages = useExprContext();
  const state = useCtx().state;

  return useMemo(() => {
    if (!pages) {
      return { formErrors: [], taskErrors: [] };
    }
    const formErrors: NodeValidation<'errors'>[] = [];
    const taskErrors: BaseValidation<'errors'>[] = [];

    for (const node of pages.allNodes().filter((node) => !node.isHidden({ respectTracks: true }))) {
      formErrors.push(...getValidationsForNode(node, state, ignoreBackendValidations, 'errors'));
    }
    for (const validation of validationsOfSeverity(state.task, 'errors')) {
      taskErrors.push(validation);
    }
    return { formErrors, taskErrors };
  }, [ignoreBackendValidations, pages, state]);
}

/**
 * Updates an existing validation states using the values from the new state.
 */
function updateValidationState(prevState: ValidationState, newState: ValidationState): void {
  mergeFormValidations(prevState, newState);

  if (newState.task) {
    prevState.task = newState.task;
  }
}

/**
 * Remove validation from removed nodes.
 * This also removes field validations which are no longer bound to any other nodes.
 */
function purgeValidationsForNodes(
  state: ValidationState,
  removedNodes: LayoutNode[],
  currentNodes: LayoutNode[],
): void {
  if (removedNodes.length === 0) {
    return;
  }

  const fieldsToKeep = new Set<string>();
  for (const node of currentNodes) {
    if (node.item.dataModelBindings) {
      for (const field of Object.values(node.item.dataModelBindings)) {
        fieldsToKeep.add(field);
      }
    }
  }

  for (const node of removedNodes) {
    delete state.components[node.item.id];
    if (node.item.dataModelBindings) {
      for (const field of Object.values(node.item.dataModelBindings)) {
        if (!fieldsToKeep.has(field)) {
          delete state.fields[field];
        }
      }
    }
  }
}
