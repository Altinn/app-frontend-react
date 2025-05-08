import { FD } from 'src/features/formData/FormDataWrite';
import { useHasDataInBindings } from 'src/layout/Summary2/isEmpty/isEmptyComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useIsListEmpty(node: LayoutNode<'List'>) {
  const groupBinding = useNodeItem(node, (i) => i.dataModelBindings?.group);
  const numRows = FD.useFreshNumRows(groupBinding);
  const hasOtherData = useHasDataInBindings(node);

  return numRows === 0 && !hasOtherData;
}
