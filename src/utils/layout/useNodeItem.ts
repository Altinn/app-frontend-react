import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { NodeRef } from 'src/layout';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ItemFromNode<N extends LayoutNode | undefined> = N extends undefined
  ? undefined
  : N extends { item: infer I }
    ? I
    : never;

export function useNodeItem<N extends LayoutNode | undefined>(node: N): ItemFromNode<N> {
  return NodesInternal.useNodeStateSelector(node, (node) => node?.item) as ItemFromNode<N>;
}

export function useNodeDirectChildren(parent: LayoutNode, restriction?: ChildLookupRestriction): NodeRef[] {
  return NodesInternal.useNodeStateMemoSelector(parent, (store) => parent.def.pickDirectChildren(store, restriction));
}
