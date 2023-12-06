import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { useImmer } from 'use-immer';

import { createContext } from 'src/core/contexts/context';
import {
  type BaseValidation,
  type FormValidations,
  type NodeValidation,
  type ValidationContext,
  ValidationMask,
  type ValidationState,
} from 'src/features/validation';
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
  getVisibilityMask,
  hasValidationErrors,
  mergeFormValidations,
  shouldValidateNode,
  validationsFromGroups,
  validationsOfSeverity,
} from 'src/features/validation/utils';
import {
  addVisibilityForNode,
  getResolvedVisibilityForNode,
  onBeforeRowDelete,
  removeVisibilityForNode,
  setVisibilityForNode,
} from 'src/features/validation/visibility';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useExprContext } from 'src/utils/layout/ExprContext';
import type { Visibility } from 'src/features/validation/visibility';
import type { PageValidation, ValidationMasks } from 'src/layout/common.generated';
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
    mask: 0,
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
    (nodes: (LayoutNode | LayoutPage)[], newVisibility: number, rowIndex?: number) => {
      setVisibility((state) => {
        nodes.forEach((node) => setVisibilityForNode(node, state, newVisibility, rowIndex));
      });
    },
  );

  // Set visibility for the whole form
  const setRootVisibility = useEffectEvent((newVisibility: number) => {
    setVisibility((state) => {
      state.mask = newVisibility;
    });
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
  const callback = useEffectEvent((node: LayoutNode, rowIndex: number, masks: ValidationMasks): boolean => {
    const mask = getVisibilityMask(masks);

    const hasErrors = node
      .flat(true, rowIndex)
      .filter(shouldValidateNode)
      .some((n) => getValidationsForNode(n, state, mask, 'error').length > 0);

    setNodeVisibility([node], hasErrors ? mask : 0, rowIndex);
    return hasErrors;
  });

  return useCallback(
    async (node: LayoutNode, rowIndex: number, masks: ValidationMasks) => {
      await validating();
      return callback(node, rowIndex, masks);
    },
    [callback, validating],
  );
}

export const useOnDeleteGroupRow = () => useCtx().removeRowVisibilityOnDelete;

/**
 * Checks if a page has validation errors as specified by the config.
 * If there are errors, the visibility of the page is set to the specified mask.
 *
 */
export function useOnPageValidation() {
  const setNodeVisibility = useCtx().setNodeVisibility;
  const setRootVisibility = useCtx().setRootVisibility;
  const state = useCtx().state;
  const validating = useCtx().validating;
  const pageOrder = useAppSelector((state) => state.formLayout.uiConfig.pageOrderConfig.order);

  /* Ensures the callback will have the latest state */
  const callback = useEffectEvent((currentPage: LayoutPage, config: PageValidation): boolean => {
    const pageConfig = config.page ?? 'current';
    const masks = config.show;

    const mask = getVisibilityMask(masks);

    if (pageConfig === 'current') {
      const hasErrors = currentPage
        .flat(true)
        .filter(shouldValidateNode)
        .some((n) => getValidationsForNode(n, state, mask, 'error').length > 0);

      setNodeVisibility([currentPage], hasErrors ? mask : 0);
      return hasErrors;
    } else if (pageConfig === 'currentAndPrevious') {
      const currentIndex = pageOrder?.indexOf(currentPage.top.myKey);
      if (!pageOrder || !currentIndex) {
        return false;
      }
      const pageKeysToCheck = pageOrder.slice(0, currentIndex + 1);
      const layoutPagesToCheck = pageKeysToCheck.map((key) => currentPage.top.collection.all()[key]);
      const hasErrors = layoutPagesToCheck
        .flatMap((page) => page.flat(true))
        .filter(shouldValidateNode)
        .some((n) => getValidationsForNode(n, state, mask, 'error').length > 0);

      setNodeVisibility(layoutPagesToCheck, hasErrors ? mask : 0);
      return hasErrors;
    } else {
      const hasErrors = currentPage.top.collection
        .allNodes()
        .filter(shouldValidateNode)
        .some((n) => getValidationsForNode(n, state, mask, 'error').length > 0);

      setRootVisibility(hasErrors ? mask : 0);
      return hasErrors;
    }
  });

  return useCallback(
    async (currentPage: LayoutPage, config: PageValidation) => {
      await validating();
      return callback(currentPage, config);
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
    const hasFrontendErrors = layoutPages
      .allNodes()
      .filter(shouldValidateNode)
      .some((n) => getValidationsForNode(n, state, ValidationMask.All, 'error').length > 0);

    if (hasFrontendErrors) {
      setRootVisibility(ValidationMask.All);
      return true;
    }

    const hasAnyErrors =
      hasValidationErrors(state.task) ||
      layoutPages
        .allNodes()
        .filter(shouldValidateNode)
        .some((n) => getValidationsForNode(n, state, ValidationMask.All_Including_Backend, 'error').length > 0);

    if (hasAnyErrors) {
      setRootVisibility(ValidationMask.All_Including_Backend);
      return true;
    }

    setRootVisibility(0);
    return false;
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
export function useUnifiedValidationsForNode(node: LayoutNode | undefined): NodeValidation[] {
  const state = useCtx().state;
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!node) {
      return [];
    }
    return getValidationsForNode(node, state, getResolvedVisibilityForNode(node, visibility));
  }, [node, state, visibility]);
}

/**
 * Returns all validation messages for a nodes children and optionally the node itself.
 */
export function useDeepValidationsForNode(
  node: LayoutNode | undefined,
  onlyChildren: boolean = false,
  onlyInRowIndex?: number,
): NodeValidation[] {
  const state = useCtx().state;
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!node) {
      return [];
    }
    const nodesToValidate = onlyChildren ? node.flat(true, onlyInRowIndex) : [node, ...node.flat(true, onlyInRowIndex)];
    return nodesToValidate.flatMap((node) =>
      getValidationsForNode(node, state, getResolvedVisibilityForNode(node, visibility)),
    );
  }, [node, onlyChildren, onlyInRowIndex, state, visibility]);
}

/**
 * Gets all validations that are bound to a data model field,
 * including component validations which have a binding key association.
 */
export function useBindingValidationsForNode<
  N extends LayoutNode,
  T extends CompTypes = N extends BaseLayoutNode<any, infer T> ? T : never,
>(node: N): { [binding in keyof NonNullable<IDataModelBindings<T>>]: NodeValidation[] } | undefined {
  const state = useCtx().state;
  const fields = state.fields;
  const component = state.components[node.item.id];
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!node.item.dataModelBindings) {
      return undefined;
    }
    const mask = getResolvedVisibilityForNode(node, visibility);
    const bindingValidations = {};
    for (const [bindingKey, field] of Object.entries(node.item.dataModelBindings)) {
      bindingValidations[bindingKey] = [];

      if (fields[field]) {
        const validations = validationsFromGroups(fields[field], mask);
        bindingValidations[bindingKey].push(
          ...validations.map((validation) => buildNodeValidation(node, validation, bindingKey)),
        );
      }
      if (component?.bindingKeys?.[bindingKey]) {
        const validations = validationsFromGroups(component.bindingKeys[bindingKey], mask);
        bindingValidations[bindingKey].push(
          ...validations.map((validation) => buildNodeValidation(node, validation, bindingKey)),
        );
      }
    }
    return bindingValidations as { [binding in keyof NonNullable<IDataModelBindings<T>>]: NodeValidation[] };
  }, [node, visibility, fields, component]);
}

/**
 * Get only the component validations which are not bound to any data model fields.
 */
export function useComponentValidationsForNode(node: LayoutNode): NodeValidation[] {
  const component = useCtx().state.components[node.item.id];
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!component?.component) {
      return [];
    }
    const validations = validationsFromGroups(component.component!, getResolvedVisibilityForNode(node, visibility));
    return validations.map((validation) => buildNodeValidation(node, validation));
  }, [component.component, node, visibility]);
}

/**
 * Returns all validation errors (not warnings, info, etc.) for a layout set.
 * This includes unmapped/task errors as well
 */
export function useTaskErrors(): {
  formErrors: NodeValidation<'error'>[];
  taskErrors: BaseValidation<'error'>[];
} {
  const pages = useExprContext();
  const state = useCtx().state;
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!pages) {
      return { formErrors: [], taskErrors: [] };
    }
    const formErrors: NodeValidation<'error'>[] = [];
    const taskErrors: BaseValidation<'error'>[] = [];

    for (const node of pages.allNodes().filter(shouldValidateNode)) {
      formErrors.push(...getValidationsForNode(node, state, getResolvedVisibilityForNode(node, visibility), 'error'));
    }
    for (const validation of validationsOfSeverity(state.task, 'error')) {
      taskErrors.push(validation);
    }
    return { formErrors, taskErrors };
  }, [pages, state, visibility]);
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
