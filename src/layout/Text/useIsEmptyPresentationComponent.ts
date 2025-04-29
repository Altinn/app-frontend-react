import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useIsEmptyPresentationComponent(node: LayoutNode<'Text' | 'Date' | 'Number' | 'Option'>) {
  const value = useNodeItem(node, (i) => i.value);
  return value === undefined || value === null || value === '';
}
