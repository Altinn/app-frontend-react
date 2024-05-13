import { useMemo } from 'react';

import type { NodeValidation } from '..';

import { filterValidations, selectValidations } from 'src/features/validation/utils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeTraversal } from 'src/utils/layout/useNodeTraversal';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const emptyArray: NodeValidation[] = [];

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
  const nodesToValidate = useNodeTraversal((t) => {
    if (!node || t.targetIsRoot()) {
      return [];
    }

    if (onlyChildren) {
      return t.children();
    }
    if (!onlyInRowUuid) {
      return t.flat();
    }

    return t.flat(undefined, { onlyInRowUuid });
  }, node);

  return useMemo(() => {
    if (!nodesToValidate || nodesToValidate.length === 0) {
      return emptyArray;
    }

    return nodesToValidate.flatMap((node) => {
      const mask = visibilitySelector(node);
      const validations = validationsSelector(node);
      const filtered = filterValidations(selectValidations(validations, mask), node);
      return filtered.map((validation) => ({ ...validation, node }));
    });
  }, [nodesToValidate, visibilitySelector, validationsSelector]);
}
