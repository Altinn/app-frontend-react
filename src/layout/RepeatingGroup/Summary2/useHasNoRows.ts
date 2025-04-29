import { FD } from 'src/features/formData/FormDataWrite';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useRepeatingGroupHasNoRows(node: LayoutNode<'RepeatingGroup'>) {
  const groupBinding = useNodeItem(node, (i) => i.dataModelBindings.group);
  return FD.useFreshNumRows(groupBinding) === 0;
}
