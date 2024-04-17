import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ItemFromNode<N extends LayoutNode | undefined> = N extends undefined
  ? undefined
  : N extends { item: infer I }
    ? I
    : never;

export function useNodeItem<N extends LayoutNode | undefined>(node: N): ItemFromNode<N> {
  return NodesInternal.useNodeStateSelector(node, (node) => node?.item) as ItemFromNode<N>;
}
