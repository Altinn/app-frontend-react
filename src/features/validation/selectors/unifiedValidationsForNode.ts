import { useMemo } from 'react';

import type { NodeValidation } from '..';

import { getValidationsForNode } from 'src/features/validation/utils';
import { Validation } from 'src/features/validation/validationContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { ValidationLookupSources } from 'src/features/validation/utils';
import type { ItemStore } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Returns all validation messages for a given node.
 * Both validations connected to specific data model bindings,
 * and general component validations in a single list.
 */
const emptyArray = [];
export function useUnifiedValidationsForNode(node: LayoutNode | undefined): NodeValidation[] {
  const visibility = NodesInternal.useNodeStateSelector(node, (state: ItemStore) =>
    'validationVisibility' in state ? state.validationVisibility : 0,
  );

  const selector = Validation.useSelector();
  const nodeValidationsSelector = NodesInternal.useValidationsSelector();

  return useMemo(() => {
    if (!node) {
      return emptyArray;
    }

    const findIn: ValidationLookupSources = {
      validationState: selector,
      nodeValidationsSelector,
    };

    return getValidationsForNode(node, findIn, visibility);
  }, [node, nodeValidationsSelector, selector, visibility]);
}
