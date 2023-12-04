import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { useImmer } from 'use-immer';

import { createContext } from 'src/core/contexts/context';
import { ValidationUrgency } from 'src/features/validation';
import { useBackendValidation } from 'src/features/validation/backend/runServerValidation';
import { runValidationOnNodes } from 'src/features/validation/frontend/runValidations';
import {
  useEffectEvent,
  useOnAttachmentsChange,
  useOnHierarchyChange,
  useOnNodeDataChange,
  useValidationContextGenerator,
} from 'src/features/validation/hooks';
import {
  buildNodeValidation,
  getValidationsForNode,
  hasValidationErrors,
  mergeFormValidations,
  shouldValidateNode,
  validationsFromGroups,
  validationsOfSeverity,
} from 'src/features/validation/utils';
import {
  addVisibilityForNode,
  getRawVisibilityForNode,
  getResolvedVisibilityForNode,
  onBeforeRowDelete,
  removeVisibilityForNode,
  setVisibilityForNode,
} from 'src/features/validation/visibility';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useExprContext } from 'src/utils/layout/ExprContext';
import type {
  BaseValidation,
  FormValidations,
  NodeValidation,
  ValidationContext,
  ValidationState,
} from 'src/features/validation';
import type { Visibility } from 'src/features/validation/visibility';
import type { CompGroupRepeatingInternal } from 'src/layout/Group/config.generated';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';
import type { CompTypes, IDataModelBindings } from 'src/layout/layout';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

const { Provider, useCtx } = createContext<ValidationContext>({
  name: 'ValidationContext',
  required: true,
});

export function ValidationContext({ children }) {
  const validationContextGenerator = useValidationContextGenerator();

  const [frontendValidations, setFrontendValidations] = useImmer<FormValidations>({
    fields: {},
    components: {},
  });
  const [visibility, setVisibility] = useImmer<Visibility>({
    urgency: 0,
    children: {},
    items: [],
  });

  // Update frontend validations for nodes when their data changes
  useOnNodeDataChange((nodeChanges) => {
    const changedNodes = nodeChanges.map((nC) => nC.node);
    const newValidations = runValidationOnNodes(changedNodes, validationContextGenerator);

    setFrontendValidations((state) => {
      mergeFormValidations(state, newValidations);
    });
  });

  // Update frontend validations and visibility for nodes when they are added or removed
  useOnHierarchyChange((addedNodeChanges, removedNodes, currentNodes) => {
    const addedNodes = addedNodeChanges.map((nC) => nC.node);
    const newValidations = runValidationOnNodes(addedNodes, validationContextGenerator);

    setFrontendValidations((state) => {
      purgeValidationsForNodes(state, removedNodes, currentNodes);
      mergeFormValidations(state, newValidations);
    });

    setVisibility((state) => {
      removedNodes.forEach((node) => removeVisibilityForNode(node, state));
      addedNodes.forEach((node) => addVisibilityForNode(node, state));
    });
  });

  // Update frontend validations for nodes when their attachments change
  useOnAttachmentsChange((changedNodes) => {
    const newValidations = runValidationOnNodes(changedNodes, validationContextGenerator);

    setFrontendValidations((state) => {
      mergeFormValidations(state, newValidations);
    });
  });

  // Get backend validations
  const { backendValidations, isFetching } = useBackendValidation();
  const isSaving = useAppSelector((state) => state.formData.saving);

  // Merge backend and frontend validations
  const validations = useMemo(() => {
    const validations: ValidationState = { fields: {}, components: {}, task: [] };
    if (backendValidations) {
      mergeValidationState(validations, backendValidations);
    }
    mergeFormValidations(validations, frontendValidations);
    return validations;
  }, [backendValidations, frontendValidations]);

  // Provide a promise that resolves when all pending validations have been completed
  const pending = useRef(false);
  useEffect(() => {
    pending.current = isFetching || isSaving;
  }, [isFetching, isSaving]);
  const validating = useCallback(async () => {
    while (pending.current) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }, []);

  // Set visibility for a node
  const setNodeVisibility = useEffectEvent(
    (node: LayoutNode | LayoutPage, newVisibility: number, rowIndex?: number) => {
      const currentVisibility = getRawVisibilityForNode(node, visibility, rowIndex);
      if (currentVisibility != newVisibility) {
        setVisibility((state) => {
          setVisibilityForNode(node, state, newVisibility, rowIndex);
        });
      }
    },
  );

  // Set visibility for the whole form
  const setRootVisibility = useEffectEvent((newVisibility: boolean) => {
    const newUrgency = newVisibility ? ValidationUrgency.Submit : 0;
    if (visibility.urgency != newUrgency) {
      setVisibility((state) => {
        state.urgency = newUrgency;
      });
    }
  });

  // Properly remove visibility for a row when it is deleted
  const removeRowVisibilityOnDelete = useEffectEvent(
    (node: LayoutNodeForGroup<CompGroupRepeatingInternal>, rowIndex: number) => {
      setVisibility((state) => {
        onBeforeRowDelete(node, rowIndex, state);
      });
    },
  );

  const out = {
    state: validations,
    validating,
    visibility,
    setNodeVisibility,
    setRootVisibility,
    removeRowVisibilityOnDelete,
  };

  return <Provider value={out}>{children}</Provider>;
}

export function useOnGroupCloseValidation() {
  const setNodeVisibility = useCtx().setNodeVisibility;
  const state = useCtx().state;
  const validating = useCtx().validating;

  /* Ensures the callback will have the latest state */
  const callback = useEffectEvent((node: LayoutNode, rowIndex: number): boolean => {
    const hasErrors = node
      .flat(true, rowIndex)
      .filter(shouldValidateNode)
      .some((n) => getValidationsForNode(n, state, ValidationUrgency.Submit, true, 'errors').length > 0);

    setNodeVisibility(node, hasErrors ? ValidationUrgency.Submit : ValidationUrgency.Immediate, rowIndex);
    return hasErrors;
  });

  return useCallback(
    async (node: LayoutNode, rowIndex: number) => {
      await validating();
      return callback(node, rowIndex);
    },
    [callback, validating],
  );
}

export const useOnDeleteGroupRow = () => useCtx().removeRowVisibilityOnDelete;

/**
 * Sets the urgency for all nodes on a page to OnPageNext to display any errors.
 * Also returns a boolean indicating whether there currently are any errors on the page
 * with urgency >= OnPageNext.
 */
export function useOnPageNextValidation() {
  const setNodeVisibility = useCtx().setNodeVisibility;
  const state = useCtx().state;
  const validating = useCtx().validating;

  /* Ensures the callback will have the latest state */
  const callback = useEffectEvent((currentPage: LayoutPage): boolean => {
    const hasErrors = currentPage
      .flat(true)
      .filter(shouldValidateNode)
      .some((n) => getValidationsForNode(n, state, ValidationUrgency.Submit, true, 'errors').length > 0);

    setNodeVisibility(currentPage, hasErrors ? ValidationUrgency.Submit : ValidationUrgency.Immediate);
    return hasErrors;
  });

  return useCallback(
    async (currentPage: LayoutPage) => {
      await validating();
      return callback(currentPage);
    },
    [callback, validating],
  );
}

export function useOnFormSubmitValidation() {
  const setRootVisibility = useCtx().setRootVisibility;
  const state = useCtx().state;
  const validating = useCtx().validating;

  /* Ensures the callback will have the latest state */
  const callback = useEffectEvent((layoutPages: LayoutPages): boolean => {
    const hasErrors =
      hasValidationErrors(state.task) ||
      layoutPages
        .allNodes()
        .filter(shouldValidateNode)
        .some((n) => getValidationsForNode(n, state, ValidationUrgency.Submit, true, 'errors').length > 0);

    setRootVisibility(hasErrors);
    return hasErrors;
  });

  return useCallback(
    async (layoutPages: LayoutPages) => {
      await validating();
      return callback(layoutPages);
    },
    [callback, validating],
  );
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
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!node) {
      return [];
    }
    return getValidationsForNode(node, state, getResolvedVisibilityForNode(node, visibility), ignoreBackendValidations);
  }, [ignoreBackendValidations, node, state, visibility]);
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
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!node) {
      return [];
    }
    const nodesToValidate = onlyChildren ? node.flat(true, onlyInRowIndex) : [node, ...node.flat(true, onlyInRowIndex)];
    return nodesToValidate.flatMap((node) =>
      getValidationsForNode(node, state, getResolvedVisibilityForNode(node, visibility), ignoreBackendValidations),
    );
  }, [ignoreBackendValidations, node, onlyChildren, onlyInRowIndex, state, visibility]);
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
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!node.item.dataModelBindings) {
      return undefined;
    }
    const urgency = getResolvedVisibilityForNode(node, visibility);
    const bindingValidations = {};
    for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
      bindingValidations[bindingKey] = [];

      if (fields[field]) {
        const validations = validationsFromGroups(fields[field], urgency, ignoreBackendValidations);
        bindingValidations[bindingKey].push(
          ...validations.map((validation) => buildNodeValidation(node, validation, bindingKey)),
        );
      }
      if (component?.bindingKeys?.[bindingKey]) {
        const validations = validationsFromGroups(component.bindingKeys[bindingKey], urgency, ignoreBackendValidations);
        bindingValidations[bindingKey].push(
          ...validations.map((validation) => buildNodeValidation(node, validation, bindingKey)),
        );
      }
    }
    return bindingValidations as { [binding in keyof NonNullable<IDataModelBindings<T>>]: NodeValidation[] };
  }, [node, visibility, fields, component, ignoreBackendValidations]);
}

/**
 * Get only the component validations which are not bound to any data model fields.
 */
export function useComponentValidationsForNode(node: LayoutNode, ignoreBackendValidations = true): NodeValidation[] {
  const component = useCtx().state.components[node.item.id];
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!component?.component) {
      return [];
    }
    const validations = validationsFromGroups(
      component.component!,
      getResolvedVisibilityForNode(node, visibility),
      ignoreBackendValidations,
    );
    return validations.map((validation) => buildNodeValidation(node, validation));
  }, [component.component, ignoreBackendValidations, node, visibility]);
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
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!pages) {
      return { formErrors: [], taskErrors: [] };
    }
    const formErrors: NodeValidation<'errors'>[] = [];
    const taskErrors: BaseValidation<'errors'>[] = [];

    for (const node of pages.allNodes().filter(shouldValidateNode)) {
      formErrors.push(
        ...getValidationsForNode(
          node,
          state,
          getResolvedVisibilityForNode(node, visibility),
          ignoreBackendValidations,
          'errors',
        ),
      );
    }
    for (const validation of validationsOfSeverity(state.task, 'errors')) {
      taskErrors.push(validation);
    }
    return { formErrors, taskErrors };
  }, [ignoreBackendValidations, pages, state, visibility]);
}

/**
 * Updates an existing validation states using the values from the new state.
 */
function mergeValidationState(prevState: ValidationState, newState: ValidationState): void {
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
  state: FormValidations,
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
