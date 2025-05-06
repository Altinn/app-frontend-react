import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useRepeatingGroupHasNoRows(node: LayoutNode<'RepeatingGroup'>) {
  return useNodeItem(node, (i) => i.rows.filter((row) => row && !row.groupExpressions?.hiddenRow).length === 0);
}
