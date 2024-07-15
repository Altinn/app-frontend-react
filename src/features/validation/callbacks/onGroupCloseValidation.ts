import { useCallback } from 'react';

import { getVisibilityMask } from 'src/features/validation/utils';
import { Validation } from 'src/features/validation/validationContext';
import { useEffectEvent } from 'src/hooks/useEffectEvent';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { AllowedValidationMasks } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Checks if a repeating group row has validation errors when the group is closed.
 * If there are errors, the visibility is set, and will return true, indicating that the row should not be closed.
 */
export function useOnGroupCloseValidation() {
  const setNodeVisibility = NodesInternal.useSetNodeVisibility();
  const nodeValidationSelector = NodesInternal.useValidationsSelector();
  const validating = Validation.useValidating();
  const traversalSelector = useNodeTraversalSelector();

  /* Ensures the callback will have the latest state */
  const callback = useEffectEvent((node: LayoutNode, rowUuid: string, masks: AllowedValidationMasks): boolean => {
    const mask = getVisibilityMask(masks);

    const nodesWithErrors = traversalSelector(
      (t) =>
        t
          .with(node)
          .children(undefined, { onlyInRowUuid: rowUuid })
          .map((child) => t.with(child).flat())
          .flat()
          .filter((n) => nodeValidationSelector(n, mask, 'error').length > 0),
      [node, rowUuid, mask, nodeValidationSelector],
    );

    if (nodesWithErrors.length > 0) {
      setNodeVisibility(nodesWithErrors, mask);
      return true;
    }

    return false;
  });

  return useCallback(
    async (node: LayoutNode, rowUuid: string, masks: AllowedValidationMasks) => {
      await validating();
      return callback(node, rowUuid, masks);
    },
    [callback, validating],
  );
}
