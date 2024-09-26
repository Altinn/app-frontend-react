import type { NodeRefValidation } from '..';

import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { TraversalRestriction } from 'src/utils/layout/useNodeTraversal';

/**
 * Returns all validation messages for a nodes children and optionally the node itself.
 */
export function useDeepValidationsForNode(
  node: LayoutNode | undefined,
  onlyChildren: boolean = false,
  restriction?: TraversalRestriction,
): NodeRefValidation[] {
  return NodesInternal.useVisibleValidationsDeep(node, onlyChildren ? 1 : undefined, restriction);
}
