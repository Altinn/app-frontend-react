import React, { useCallback, useMemo } from 'react';

import { useImmer } from 'use-immer';

import { createContext } from 'src/core/contexts/context';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { useLanguage } from 'src/features/language/useLanguage';
import { runServerValidations } from 'src/features/validation/backend/runServerValidation';
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
import { useExprContext } from 'src/utils/layout/ExprContext';
import { getDataValidationUrl } from 'src/utils/urls/appUrlHelper';
import type { BaseValidation, NodeValidation, ValidationContext, ValidationState } from 'src/features/validation';
import type { Visibility } from 'src/features/validation/visibility';
import type { CompGroupRepeatingInternal } from 'src/layout/Group/config.generated';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';
import type { CompTypes, IDataModelBindings } from 'src/layout/layout';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

const { Provider, useCtx } = createContext<ValidationContext>({ name: 'ValidationContext', required: true });

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
  const [visibility, setVisibility] = useImmer<Visibility>({
    visible: false,
    children: {},
    items: [],
  });

  useOnNodeDataChange(async (nodeChanges) => {
    const changedNodes = nodeChanges.map((nC) => nC.node);
    const serverPromise = runServerValidations(nodeChanges, validationUrl, langTools);
    const newValidations = runValidationOnNodes(changedNodes, validationContextGenerator);
    const serverValidations = await serverPromise;

    setValidations((state) => {
      mergeFormValidations(state, newValidations);
      updateValidationState(state, serverValidations);
    });
  });

  useOnHierarchyChange(async (addedNodeChanges, removedNodes, currentNodes) => {
    const addedNodes = addedNodeChanges.map((nC) => nC.node);
    const serverPromise = runServerValidations(addedNodeChanges, validationUrl, langTools);
    const newValidations = runValidationOnNodes(addedNodes, validationContextGenerator);
    const serverValidations = await serverPromise;

    setValidations((state) => {
      purgeValidationsForNodes(state, removedNodes, currentNodes);
      mergeFormValidations(state, newValidations);
      updateValidationState(state, serverValidations);
    });

    setVisibility((state) => {
      removedNodes.forEach((node) => removeVisibilityForNode(node, state));
      addedNodes.forEach((node) => addVisibilityForNode(node, state));
    });
  });

  useOnAttachmentsChange((changedNodes) => {
    const newValidations = runValidationOnNodes(changedNodes, validationContextGenerator);

    setValidations((state) => {
      mergeFormValidations(state, newValidations);
    });
  });

  const setNodeVisibility = useEffectEvent(
    (node: LayoutNode | LayoutPage, newVisibility: boolean, rowIndex?: number) => {
      const currentVisibility = getRawVisibilityForNode(node, visibility, rowIndex);
      if (currentVisibility != newVisibility) {
        setVisibility((state) => {
          setVisibilityForNode(node, state, newVisibility, rowIndex);
        });
      }
    },
  );

  const setRootVisibility = useEffectEvent((newVisibility: boolean) => {
    if (visibility.visible != newVisibility) {
      setVisibility((state) => {
        state.visible = newVisibility;
      });
    }
  });

  const removeRowVisibilityOnDelete = useEffectEvent(
    (node: LayoutNodeForGroup<CompGroupRepeatingInternal>, rowIndex: number) => {
      setVisibility((state) => {
        onBeforeRowDelete(node, rowIndex, state);
      });
    },
  );

  const out = {
    state: validations,
    visibility,
    setNodeVisibility,
    setRootVisibility,
    removeRowVisibilityOnDelete,
  };

  return <Provider value={out}>{children}</Provider>;
}

export function useShowNodeValidation() {
  const setNodeVisibility = useCtx().setNodeVisibility;

  return useCallback(
    (node: LayoutNode): void => {
      setNodeVisibility(node, true);
    },
    [setNodeVisibility],
  );
}

export function useOnGroupCloseValidation() {
  const setNodeVisibility = useCtx().setNodeVisibility;
  const state = useCtx().state;

  return useCallback(
    (node: LayoutNode, rowIndex: number): boolean => {
      const hasErrors = node
        .flat(true, rowIndex)
        .filter(shouldValidateNode)
        .some((n) => getValidationsForNode(n, state, true, 'errors').length > 0);

      setNodeVisibility(node, hasErrors, rowIndex);
      return hasErrors;
    },
    [setNodeVisibility, state],
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

  return useCallback(
    (currentPage: LayoutPage): boolean => {
      const hasErrors = currentPage
        .flat(true)
        .filter(shouldValidateNode)
        .some((n) => getValidationsForNode(n, state, true, 'errors').length > 0);

      setNodeVisibility(currentPage, hasErrors);
      return hasErrors;
    },
    [setNodeVisibility, state],
  );
}

export function useOnFormSubmitValidation() {
  const setRootVisibility = useCtx().setRootVisibility;
  const state = useCtx().state;

  return useCallback(
    (layoutPages: LayoutPages): boolean => {
      const hasErrors =
        hasValidationErrors(state.task) ||
        layoutPages
          .allNodes()
          .filter(shouldValidateNode)
          .some((n) => getValidationsForNode(n, state, true, 'errors').length > 0);

      setRootVisibility(hasErrors);
      return hasErrors;
    },
    [setRootVisibility, state],
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
    if (!node || !getResolvedVisibilityForNode(node, visibility)) {
      return [];
    }
    return getValidationsForNode(node, state, ignoreBackendValidations);
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
    return nodesToValidate
      .filter((node) => getResolvedVisibilityForNode(node, visibility))
      .flatMap((node) => getValidationsForNode(node, state, ignoreBackendValidations));
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
    if (!node.item.dataModelBindings || !getResolvedVisibilityForNode(node, visibility)) {
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
  }, [node, visibility, fields, component, ignoreBackendValidations]);
}

/**
 * Get only the component validations which are not bound to any data model fields.
 */
export function useComponentValidationsForNode(node: LayoutNode, ignoreBackendValidations = true): NodeValidation[] {
  const component = useCtx().state.components[node.item.id];
  const visibility = useCtx().visibility;

  return useMemo(() => {
    if (!component?.component || !getResolvedVisibilityForNode(node, visibility)) {
      return [];
    }
    const validations = validationsFromGroups(component.component!, ignoreBackendValidations);
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

    for (const node of pages
      .allNodes()
      .filter(shouldValidateNode)
      .filter((n) => getResolvedVisibilityForNode(n, visibility))) {
      formErrors.push(...getValidationsForNode(node, state, ignoreBackendValidations, 'errors'));
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
