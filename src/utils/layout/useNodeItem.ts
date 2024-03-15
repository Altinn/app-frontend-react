import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

type ValidNodes = LayoutNode | LayoutPage | undefined;
type ItemFromNode<N extends ValidNodes> = N extends undefined ? undefined : N extends { item: infer I } ? I : never;

export function useNodeItem<N extends ValidNodes>(node: N): ItemFromNode<N> {
  return node?.item as ItemFromNode<N>;
}
