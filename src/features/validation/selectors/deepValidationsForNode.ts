import { useMemo } from 'react';

import type { NodeValidation } from '..';

import { getValidationsForNode } from 'src/features/validation/utils';
import { Validation } from 'src/features/validation/validationContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { ValidationLookupSources } from 'src/features/validation/utils';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Returns all validation messages for a nodes children and optionally the node itself.
 */
export function useDeepValidationsForNode(
  node: LayoutNode | undefined,
  onlyChildren: boolean = false,
  onlyInRowUuid?: string,
): NodeValidation[] {
  const selector = Validation.useSelector();
  const visibilitySelector = NodesInternal.useValidationVisibilitySelector();
  const validationsSelector = NodesInternal.useValidationsSelector();

  return useMemo(() => {
    if (!node) {
      return [];
    }

    const findIn: ValidationLookupSources = {
      validationState: selector,
      nodeValidationsSelector: validationsSelector,
    };

    const restriction = onlyInRowUuid ? { onlyInRowUuid } : undefined;
    const nodesToValidate = onlyChildren ? node.flat(restriction) : [node, ...node.flat(restriction)];
    return nodesToValidate.flatMap((node) => getValidationsForNode(node, findIn, visibilitySelector(node)));
  }, [node, onlyChildren, onlyInRowUuid, selector, validationsSelector, visibilitySelector]);
}
