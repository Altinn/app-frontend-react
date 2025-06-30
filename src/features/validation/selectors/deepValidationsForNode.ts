import { Validation } from 'src/features/validation/validationContext';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { NodeRefValidation } from 'src/features/validation/index';

/**
 * Returns all validation messages for a nodes children and optionally the node itself.
 */
export function useDeepValidationsForNode(
  baseComponentId: string,
  includeSelf = true,
  restriction?: number | undefined,
): NodeRefValidation[] {
  const showAll = Validation.useShowAllBackendErrors();
  const mask = showAll ? 'showAll' : 'visible';
  const indexedId = useIndexedId(baseComponentId);
  return NodesInternal.useVisibleValidationsDeep(indexedId, mask, includeSelf, restriction);
}
