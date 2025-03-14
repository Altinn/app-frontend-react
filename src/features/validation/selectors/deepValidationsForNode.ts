import { Validation } from 'src/features/validation/validationContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { NodeRefValidation } from 'src/features/validation/index';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Returns all validation messages for a nodes children and optionally the node itself.
 */
export function useDeepValidationsForNode(
  node: LayoutNode | undefined,
  includeSelf = true,
  restriction?: number | undefined,
): NodeRefValidation[] {
  const showAll = Validation.useShowAllBackendErrors();
  const mask = showAll ? 'showAll' : 'visible';
  return NodesInternal.useVisibleValidationsDeep(node, mask, includeSelf, restriction);
}
