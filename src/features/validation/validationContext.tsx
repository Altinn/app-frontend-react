import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useImmer } from 'use-immer';

import { createContext } from 'src/core/contexts/context';
import { useHasPendingAttachments } from 'src/features/attachments/AttachmentsContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { ValidationMask } from 'src/features/validation';
import { useBackendValidation } from 'src/features/validation/backend/useBackendValidation';
import { runValidationOnNodes } from 'src/features/validation/frontend/runValidations';
import {
  useOnAttachmentsChange,
  useOnHierarchyChange,
  useOnNodeDataChange,
  useValidationDataSources,
} from 'src/features/validation/hooks';
import {
  getValidationsForNode,
  getVisibilityMask,
  hasValidationErrors,
  mergeFieldValidations,
  mergeNewFrontendValidations,
  purgeValidationsForNodes,
  selectValidations,
} from 'src/features/validation/utils';
import {
  addVisibilityForAttachment,
  addVisibilityForNode,
  getVisibilityForNode,
  onBeforeRowDelete,
  removeVisibilityForAttachment,
  removeVisibilityForNode,
  setVisibilityForAttachment,
  setVisibilityForNode,
} from 'src/features/validation/visibility';
import { useEffectEvent } from 'src/hooks/useEffectEvent';
import { useWaitForState } from 'src/hooks/useWaitForState';
import type { FrontendValidations, ValidationContext } from 'src/features/validation';
import type { Visibility } from 'src/features/validation/visibility';
import type { CompRepeatingGroupInternal } from 'src/layout/RepeatingGroup/config.generated';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';

const { Provider, useCtx } = createContext<ValidationContext>({
  name: 'ValidationContext',
  required: true,
});

export function ValidationContext({ children }) {
  const validationContext = useValidationDataSources();

  const [frontendValidations, setFrontendValidations] = useImmer<FrontendValidations>({
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
      mergeNewFrontendValidations(state, newValidations);
    });

    validating().then(() => {
      reduceNodeVisibility(changedNodes);
    });
  });

  // Update frontend validations and visibility for nodes when they are added or removed
  useOnHierarchyChange((addedNodes, removedNodes, currentNodes) => {
    const newValidations = runValidationOnNodes(addedNodes, validationContext);

    setFrontendValidations((state) => {
      purgeValidationsForNodes(state, removedNodes, currentNodes);
      mergeNewFrontendValidations(state, newValidations);
    });

    setVisibility((state) => {
      removedNodes.forEach((node) => removeVisibilityForNode(node, state));
      addedNodes.forEach((node) => addVisibilityForNode(node, state));
    });
  });

  // Update frontend validations for nodes when their attachments change
  const attachmentsBusy = useOnAttachmentsChange((changedNodes, addedAttachments, removedAttachments) => {
    const newValidations = runValidationOnNodes(changedNodes, validationContext);

    setFrontendValidations((state) => {
      mergeNewFrontendValidations(state, newValidations);
    });

    setVisibility((state) => {
      removedAttachments.forEach(({ attachmentId, node }) => removeVisibilityForAttachment(attachmentId, node, state));
      addedAttachments.forEach(({ attachmentId, node }) => addVisibilityForAttachment(attachmentId, node, state));
    });
  });

  // Get backend validations
  const lastSaveValidations = FD.useLastSaveValidationIssues();
  const backendValidations = useBackendValidation(lastSaveValidations);
  const hasUnsavedFormData = FD.useHasUnsavedChanges();
  const hasPendingAttachments = useHasPendingAttachments();

  // Merge backend and frontend validations
  const validations = useMemo(
    () => ({
      task: backendValidations.task,
      fields: mergeFieldValidations(backendValidations.fields, frontendValidations.fields),
      components: frontendValidations.components,
    }),
    [backendValidations, frontendValidations],
  );

  // Provide a promise that resolves when all pending validations have been completed
  const waitForValidating = useWaitForState(hasUnsavedFormData || hasPendingAttachments || attachmentsBusy);

  const validating = useCallback(async () => {
    await waitForValidating((state) => !state);
  }, [waitForValidating]);

  const reduceNodeVisibility = useEffectEvent((nodes: LayoutNode[]) => {
    setVisibility((state) => {
      for (const node of nodes) {
        const currentValidationMask = getValidationsForNode(
          node,
          validations,
          ValidationMask.AllIncludingBackend,
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
    (node: BaseLayoutNode<CompRepeatingGroupInternal>, rowIndex: number) => {
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
        Object.values(validations.fields).flatMap((field) => selectValidations(field, backendMask, 'error')).length > 0;

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

export const useValidationContext = useCtx;
export const useOnDeleteGroupRow = () => useCtx().removeRowVisibilityOnDelete;
