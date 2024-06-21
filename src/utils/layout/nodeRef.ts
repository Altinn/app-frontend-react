import type { NodeRef } from 'src/layout';

/**
 * @deprecated
 */
export function isNodeRef(ref: any): ref is NodeRef {
  return (
    ref !== undefined &&
    ref !== null &&
    typeof ref === 'object' &&
    'nodeRef' in ref &&
    typeof ref.nodeRef === 'string' &&
    ref.nodeRef !== ''
  );
}
