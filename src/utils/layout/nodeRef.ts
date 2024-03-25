import { useNode } from 'src/utils/layout/NodesContext';
import type { NodeRef } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type MaybeNodeRef = NodeRef | undefined | null;
type RetValFromNodeRef<T extends MaybeNodeRef> = T extends undefined
  ? undefined
  : T extends null
    ? null
    : T extends NodeRef
      ? LayoutNode
      : never;

export function useNodeRef<T extends NodeRef | undefined>(ref: T): RetValFromNodeRef<T> {
  const node = useNode(ref && 'nodeRef' in ref ? ref.nodeRef : '');
  if (ref === undefined) {
    return undefined as RetValFromNodeRef<T>;
  }

  return node as RetValFromNodeRef<T>;
}

export function isNodeRef(ref: any): ref is NodeRef {
  return ref !== undefined && ref !== null && 'nodeRef' in ref && typeof ref.nodeRef === 'string' && ref.nodeRef !== '';
}
