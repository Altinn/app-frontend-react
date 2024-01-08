import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useImmer } from 'use-immer';

import { createContext } from 'src/core/contexts/context';
import { FD } from 'src/features/formData/FormDataWrite';
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
  useValidationContext,
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
  addVisibilityForAttachment,
  addVisibilityForNode,
  getResolvedVisibilityForAttachment,
  getVisibilityForNode,
  onBeforeRowDelete,
  removeVisibilityForAttachment,
  removeVisibilityForNode,
  setVisibilityForAttachment,
  setVisibilityForNode,
} from 'src/features/validation/visibility';
import { useAsRef } from 'src/hooks/useAsRef';
import { useOrder } from 'src/hooks/useNavigatePage';
import { useWaitForState } from 'src/hooks/useWaitForState';
import { useNodes } from 'src/utils/layout/NodesContext';
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
  const validationContext = useValidationContext();

  const currentFormData = useAsRef(FD.useDebounced());
  const lastValidatedFormData = useRef<object | undefined>(undefined);
  const hasValidatedCurrentFormData = lastValidatedFormData.current === currentFormData.current;

  const [frontendValidations, setFrontendValidations] = useImmer<FormValidations>({
    fields: {},
    components: {},
  });
  const [visibility, setVisibility] = useImmer<Visibility>({
    mask: 0,
    children: {},
    items: [],
  });

  /**
   * This is a last resort to show all errors, to prevent unknown error
   * if this is ever visible, there is probably something wring in the app.
   */
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Update frontend validations for nodes when their data changes
  useOnNodeDataChange((changedNodes) => {
    const newValidations = runValidationOnNodes(changedNodes, validationContext);

    setFrontendValidations((state) => {
      mergeFormValidations(state, newValidations);
    });

    lastValidatedFormData.current = currentFormData.current;
    validating().then(() => {
      reduceNodeVisibility(changedNodes);
    });
  });

  // Update frontend validations and visibility for nodes when they are added or removed
  useOnHierarchyChange((addedNodes, removedNodes, currentNodes) => {
    const newValidations = runValidationOnNodes(addedNodes, validationContext);

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
  useOnAttachmentsChange((changedNodes, addedAttachments, removedAttachments) => {
    const newValidations = runValidationOnNodes(changedNodes, validationContext);

    setFrontendValidations((state) => {
      mergeFormValidations(state, newValidations);
    });

    setVisibility((state) => {
      removedAttachments.forEach(({ attachmentId, node }) => removeVisibilityForAttachment(attachmentId, node, state));
      addedAttachments.forEach(({ attachmentId, node }) => addVisibilityForAttachment(attachmentId, node, state));
    });
  });

  // Get backend validations
  const { backendValidations, isFetching } = useBackendValidation();
  const hasUnsavedFormData = FD.useHasUnsavedChanges();

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
  const waitForValidating = useWaitForState(isFetching || hasUnsavedFormData || !hasValidatedCurrentFormData);
  const validating = useCallback(async () => {
    await waitForValidating((state) => !state);
  }, [waitForValidating]);

  const reduceNodeVisibility = useEffectEvent((nodes: LayoutNode[]) => {
    setVisibility((state) => {
      for (const node of nodes) {
        const currentValidationMask = getValidationsForNode(
          node,
          validations,
          ValidationMask.All_Including_Backend,
        ).reduce((mask, validation) => mask | validation.category, 0);

        const currentVisibilityMask = getVisibilityForNode(node, state);

        setVisibilityForNode(node, state, currentValidationMask & currentVisibilityMask);
      }
    });
  });

  // Set visibility for a node
  const setNodeVisibility = useEffectEvent((nodes: LayoutNode[], newVisibility: number, rowIndex?: number) => {
    setVisibility((state) => {
      nodes.forEach((node) => setVisibilityForNode(node, state, newVisibility, rowIndex));
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

  const setAttachmentVisibility = useEffectEvent((attachmentId: string, node: LayoutNode, newVisibility: number) => {
    setVisibility((state) => {
      setVisibilityForAttachment(attachmentId, node, state, newVisibility);
    });
  });

  /**
   * Hide unbound errors as soon as possible.
   */
  useEffect(() => {
    if (showAllErrors) {
      const backendMask = getVisibilityMask(['Backend', 'CustomBackend']);
      const hasFieldErors =
        Object.values(validations.fields).flatMap((field) => validationsFromGroups(field, backendMask, 'error'))
          .length > 0;

      if (!hasFieldErors && !hasValidationErrors(validations.task)) {
        setShowAllErrors(false);
      }
    }
  }, [showAllErrors, validations.fields, validations.task]);

  const out = {
    state: validations,
    setShowAllErrors,
    showAllErrors,
    validating,
    visibility,
    setNodeVisibility,
    setAttachmentVisibility,
    removeRowVisibilityOnDelete,
  };

  return <Provider value={out}>{children}</Provider>;
}

export function useOnAttachmentSave() {
  const setAttachmentVisibility = useCtx().setAttachmentVisibility;

  return useCallback(
    (node: LayoutNode, attachmentId: string) => {
      const mask = getVisibilityMask(['Component']);
      setAttachmentVisibility(attachmentId, node, mask);
    },
    [setAttachmentVisibility],
  );
}

export function useOnGroupCloseValidation() {
  const setNodeVisibility = useCtx().setNodeVisibility;
  const state = useCtx().state;
  const validating = useCtx().validating;

  /* Ensures the callback will have the latest state */
  const callback = useEffectEvent((node: LayoutNode, rowIndex: number, masks: ValidationMasks): boolean => {
    const mask = getVisibilityMask(masks);

    const nodesWithErrors = node
      .flat(true, rowIndex)
      .filter((n) => n.item.id !== node.item.id) // Exclude self, only check children
      .filter(shouldValidateNode)
      .filter((n) => getValidationsForNode(n, state, mask, 'error').length > 0);

    if (nodesWithErrors.length > 0) {
      setNodeVisibility(nodesWithErrors, mask);
      return true;
    }

    return false;
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
  const state = useCtx().state;
  const validating = useCtx().validating;
  const pageOrder = useOrder();

  /* Ensures the callback will have the latest state */
  const callback = useEffectEvent((currentPage: LayoutPage, config: PageValidation): boolean => {
    const pageConfig = config.page ?? 'current';
    const masks = config.show;

    const mask = getVisibilityMask(masks);
    let nodes: LayoutNode[] = [];

    const currentIndex = pageOrder.indexOf(currentPage.top.myKey);

    if (pageConfig === 'current') {
      // Get nodes for current page
      nodes = currentPage.flat(true);
    } else if (pageConfig === 'currentAndPrevious') {
      // Get nodes for current and previous pages
      if (!pageOrder || currentIndex === -1) {
        return false;
      }
      const pageKeysToCheck = pageOrder.slice(0, currentIndex + 1);
      const layoutPagesToCheck = pageKeysToCheck.map((key) => currentPage.top.collection.all()[key]);
      nodes = layoutPagesToCheck.flatMap((page) => page.flat(true));
    } else {
      // Get all nodes
      nodes = currentPage.top.collection.allNodes();
    }

    // Get nodes with errors along with their errors
    const nodeErrors = nodes
      .filter(shouldValidateNode)
      .map((n) => [n, getValidationsForNode(n, state, mask, 'error')] as const)
      .filter(([_, e]) => e.length > 0);

    if (nodeErrors.length > 0) {
      setNodeVisibility(
        nodeErrors.map(([n]) => n),
        mask,
      );

      // Only block navigation if there are errors on the current or previous pages
      return nodeErrors.some(([_, e]) => e.some((v) => pageOrder.indexOf(v.pageKey) <= currentIndex));
    }

    return false;
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
  const setNodeVisibility = useCtx().setNodeVisibility;
  const state = useCtx().state;
  const validating = useCtx().validating;
  const setShowAllErrors = useCtx().setShowAllErrors;

  /* Ensures the callback will have the latest state */
  const callback = useEffectEvent((layoutPages: LayoutPages): boolean => {
    /*
     * First: check and show any frontend errors
     */
    const nodesWithFrontendErrors = layoutPages
      .allNodes()
      .filter(shouldValidateNode)
      .filter((n) => getValidationsForNode(n, state, ValidationMask.All, 'error').length > 0);

    if (nodesWithFrontendErrors.length > 0) {
      setNodeVisibility(nodesWithFrontendErrors, ValidationMask.All);
      return true;
    }

    /*
     * Normally, backend errors should be in sync with frontend errors.
     * But if not, show them now.
     */
    const nodesWithAnyError = layoutPages
      .allNodes()
      .filter(shouldValidateNode)
      .filter((n) => getValidationsForNode(n, state, ValidationMask.All_Including_Backend, 'error').length > 0);

    if (nodesWithAnyError.length > 0) {
      setNodeVisibility(nodesWithAnyError, ValidationMask.All);
      return true;
    }

    /**
     * As a last resort, to prevent unknown error, show any backend errors
     * that cannot be mapped to any visible node.
     */
    const backendMask = getVisibilityMask(['Backend', 'CustomBackend']);
    const hasFieldErrors =
      Object.values(state.fields).flatMap((field) => validationsFromGroups(field, backendMask, 'error')).length > 0;

    if (hasFieldErrors || hasValidationErrors(state.task)) {
      setShowAllErrors(true);
      return true;
    }

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
    return getValidationsForNode(node, state, getVisibilityForNode(node, visibility));
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
      getValidationsForNode(node, state, getVisibilityForNode(node, visibility)),
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
    const mask = getVisibilityForNode(node, visibility);
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

export function useAttachmentValidations(node: LayoutNode, attachmentId: string | undefined): NodeValidation[] {
  const component = useCtx().state.components[node.item.id];
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!component?.component || !attachmentId) {
      return [];
    }
    const validations = validationsFromGroups(
      component.component!,
      getResolvedVisibilityForAttachment(attachmentId, node, visibility),
    );
    return validations
      .filter((validation) => validation.meta?.attachmentId === attachmentId)
      .map((validation) => buildNodeValidation(node, validation));
  }, [component.component, node, attachmentId, visibility]);
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
    const validations = validationsFromGroups(component.component!, getVisibilityForNode(node, visibility));
    return validations.map((validation) => buildNodeValidation(node, validation));
  }, [component, node, visibility]);
}

/**
 * Returns all validation errors (not warnings, info, etc.) for a layout set.
 * This includes unmapped/task errors as well
 */
export function useTaskErrors(): {
  formErrors: NodeValidation<'error'>[];
  taskErrors: BaseValidation<'error'>[];
} {
  const pages = useNodes();
  const state = useCtx().state;
  const visibility = useCtx().visibility;
  const showAllErrors = useCtx().showAllErrors;

  return useMemo(() => {
    if (!pages) {
      return { formErrors: [], taskErrors: [] };
    }
    const formErrors: NodeValidation<'error'>[] = [];
    const taskErrors: BaseValidation<'error'>[] = [];

    for (const node of pages.allNodes().filter(shouldValidateNode)) {
      formErrors.push(...getValidationsForNode(node, state, getVisibilityForNode(node, visibility), 'error'));
    }

    if (showAllErrors) {
      const backendMask = getVisibilityMask(['Backend', 'CustomBackend']);
      for (const field of Object.values(state.fields)) {
        taskErrors.push(...(validationsFromGroups(field, backendMask, 'error') as BaseValidation<'error'>[]));
      }
      for (const validation of validationsOfSeverity(state.task, 'error')) {
        taskErrors.push(validation);
      }
    }
    return { formErrors, taskErrors };
  }, [pages, showAllErrors, state, visibility]);
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
