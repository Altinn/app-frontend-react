import { useLayoutLookups } from 'src/features/form/layout/LayoutsContext';
import { useMakeIndexedId } from 'src/features/form/layout/utils/makeIndexedId';
import { useShallowMemo } from 'src/hooks/useShallowMemo';
import { getComponentDef, implementsDisplayData } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useDisplayData(node: LayoutNode): string {
  const def = node.def;
  if (!implementsDisplayData(def)) {
    return '';
  }

  return def.useDisplayData(node.id);
}

/**
 * Use displayData for multiple node ids at once. Make sure you always call this with the same nodeIds, otherwise
 * you'll break the rules of hooks.
 */
export function useDisplayDataFor(
  componentIds: string[],
  dataModelLocation?: IDataModelReference,
): { [componentId: string]: string } {
  const layoutLookups = useLayoutLookups();
  const output: { [componentId: string]: string } = {};
  const makeIndexedId = useMakeIndexedId(true, dataModelLocation);

  for (const id of componentIds) {
    const type = layoutLookups.getComponent(id).type;
    const def = getComponentDef(type);
    if (!implementsDisplayData(def)) {
      output[id] = '';
      continue;
    }
    const indexedId = makeIndexedId(id);
    output[id] = def.useDisplayData(indexedId);
  }

  return useShallowMemo(output);
}
