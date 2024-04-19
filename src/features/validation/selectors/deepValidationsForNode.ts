import { useMemo } from 'react';

import type { NodeValidation } from '..';

import { filterValidations, selectValidations } from 'src/features/validation/utils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Returns all validation messages for a nodes children and optionally the node itself.
 */
export function useDeepValidationsForNode(
  node: LayoutNode | undefined,
  onlyChildren: boolean = false,
  onlyInRowUuid?: string,
): NodeValidation[] {
  const visibilitySelector = NodesInternal.useValidationVisibilitySelector();
  const validationsSelector = NodesInternal.useValidationsSelector();

  return useMemo(() => {
    if (!node) {
      return [];
    }

    const restriction = onlyInRowUuid ? { onlyInRowUuid } : undefined;
    const nodesToValidate = onlyChildren ? node.flat(restriction) : [node, ...node.flat(restriction)];
    return nodesToValidate.flatMap((node) => {
      const mask = visibilitySelector(node);
      const validations = validationsSelector(node);
      const filtered = filterValidations(selectValidations(validations, mask), node);
      return filtered.map((validation) => ({ ...validation, node }));
    });
  }, [node, onlyChildren, onlyInRowUuid, visibilitySelector, validationsSelector]);
}
