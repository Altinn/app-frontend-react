import { useMemo } from 'react';

import type { NodeValidation } from '..';

import { filterValidations, selectValidations } from 'src/features/validation/utils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { ItemStore } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Returns all validation messages for a given node.
 * Both validations connected to specific data model bindings,
 * and general component validations in a single list.
 */
const emptyArray = [];
export function useUnifiedValidationsForNode(node: LayoutNode | undefined): NodeValidation[] {
  const nodeValidations = NodesInternal.useValidations(node);
  const visibility = NodesInternal.useNodeState(node, (state: ItemStore) =>
    'validationVisibility' in state ? state.validationVisibility : 0,
  );

  return useMemo(() => {
    if (!node) {
      return emptyArray;
    }

    const filtered = filterValidations(selectValidations(nodeValidations, visibility), node);
    return filtered.map((validation) => ({ ...validation, node }));
  }, [node, nodeValidations, visibility]);
}
