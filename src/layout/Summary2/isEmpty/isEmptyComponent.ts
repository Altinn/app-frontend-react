import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useHasDataInBindings(node: LayoutNode) {
  const dataModelBindings = useNodeItem(node, (i) => i.dataModelBindings);
  const { formData } = useDataModelBindings(dataModelBindings);

  // Checks if there is data in any of the string-convertable data model binding
  return Object.values(formData).some((value) => value?.length < 1);
}

export function useHasNoDataInBindings(node: LayoutNode) {
  return !useHasDataInBindings(node);
}

export function useHasBindingsAndNoData(node: LayoutNode) {
  const hasBindings = useNodeItem(node, (i) => !!i.dataModelBindings);
  return useHasNoDataInBindings(node) && hasBindings;
}
