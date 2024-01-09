import { useCallback } from 'react';

import { useEffectEvent } from 'src/features/validation/hooks';
import { getValidationsForNode, getVisibilityMask, shouldValidateNode } from 'src/features/validation/utils';
import { useValidationContext } from 'src/features/validation/validationProvider';
import type { ValidationMasks } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useOnGroupCloseValidation() {
  const setNodeVisibility = useValidationContext().setNodeVisibility;
  const state = useValidationContext().state;
  const validating = useValidationContext().validating;

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
