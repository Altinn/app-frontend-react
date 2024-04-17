import { useEffect } from 'react';

import { original } from 'immer';

import { ValidationMask, type ValidationState } from 'src/features/validation';
import { getInitialMaskFromNode, getValidationsForNode } from 'src/features/validation/utils';
import {
  getVisibilityForNode,
  setVisibilityForNode,
  type Visibility,
} from 'src/features/validation/visibility/visibilityUtils';
import { useAsRef } from 'src/hooks/useAsRef';
import { NodesInternal, useNodes } from 'src/utils/layout/NodesContext';
import type { ValidationLookupSources } from 'src/features/validation/utils';

/**
 * Manages the visibility state of validations on components
 */
export function useVisibility(
  validations: ValidationState,
  setVisibility: (updater: (draft: Visibility) => void) => void,
) {
  const layoutPages = useNodes();
  const nodesRef = useAsRef(layoutPages);
  const nodeValidationsSelector = NodesInternal.useValidationsSelector();

  /**
   * Reduce the visibility mask as validations are removed
   */
  useEffect(() => {
    const findIn: ValidationLookupSources = {
      validationState: validations,
      nodeValidationsSelector,
    };

    setVisibility((state) => {
      for (const node of nodesRef.current.allNodes()) {
        const currentValidationMask = getValidationsForNode(node, findIn, ValidationMask.AllIncludingBackend).reduce(
          (mask, validation) => mask | validation.category,
          0,
        );

        // Checking the current(state) is much cheaper than checking the draft, so its worth
        // potentially doing it twice to not make unnecessary updates
        const fasterState = original(state) ?? state;
        const currentVisibilityMask = getVisibilityForNode(node, fasterState);
        const newVisibilityMask = currentVisibilityMask & currentValidationMask;

        // Updating is a bit expensive, so only do it if the mask is different
        // We need to OR with the initial mask for comparison as this always happens when the
        // mask is updated, otherwise there could be false positives
        const initialMask = getInitialMaskFromNode(node);
        if ((newVisibilityMask | initialMask) === currentVisibilityMask) {
          continue;
        }

        setVisibilityForNode(node, state, newVisibilityMask);
      }
    });
  }, [nodeValidationsSelector, nodesRef, setVisibility, validations]);

  /**
   * Add and remove visibility as attachments are added and removed
   */
}
