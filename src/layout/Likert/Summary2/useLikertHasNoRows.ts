import { FD } from 'src/features/formData/FormDataWrite';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useLikertHasNoRows(node: LayoutNode<'Likert'>) {
  const groupBinding = useNodeItem(node, (i) => i.dataModelBindings.questions);
  return FD.useFreshNumRows(groupBinding) === 0;
}
