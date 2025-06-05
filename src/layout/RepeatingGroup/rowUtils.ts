import { FD } from 'src/features/formData/FormDataWrite';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useRepeatingGroupAllRows(node: LayoutNode<'RepeatingGroup'>) {
  const groupBinding = NodesInternal.useNodeData(node, (d) => d.layout.dataModelBindings.group);
  return FD.useFreshRows(groupBinding);
}

export function useRepeatingGroupVisibleRows(node: LayoutNode<'RepeatingGroup'>) {
  const rows = useRepeatingGroupAllRows(node);
  // TODO: Resolve expressions per row
}
