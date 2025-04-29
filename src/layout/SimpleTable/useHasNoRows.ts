import { FD } from 'src/features/formData/FormDataWrite';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useSimpleTableHasNoRows(node: LayoutNode<'SimpleTable'>) {
  const groupBinding = useNodeItem(node, (i) => i.dataModelBindings?.tableData);
  return FD.useFreshNumRows(groupBinding) === 0;
}
