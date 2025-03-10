import { useMemo } from 'react';

import { useLayoutLookups } from 'src/features/form/layout/LayoutsContext';
import { getComponentDef } from 'src/layout';
import { CompCategory } from 'src/layout/common';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const emptyArray: never[] = [];
const extraToShowInTable: CompTypes[] = ['Text', 'Number', 'Date', 'Option'];
export function useTableComponentIds(node: LayoutNode<'RepeatingGroup'>) {
  const layoutLookups = useLayoutLookups();
  const tableHeaders = layoutLookups.getComponent(node.baseId, 'RepeatingGroup').tableHeaders;
  const children =
    layoutLookups.componentToChildren[node.baseId]?.map((childId) => layoutLookups.getComponent(childId)) ?? emptyArray;

  return useMemo(() => {
    const ids = children
      .filter((child) =>
        tableHeaders
          ? tableHeaders.includes(child.id)
          : getComponentDef(child.type).category === CompCategory.Form || extraToShowInTable.includes(child.type),
      )
      .map((child) => child.id);

    // Sort using the order from tableHeaders
    if (tableHeaders) {
      ids.sort((a, b) => {
        const aIndex = tableHeaders.indexOf(a);
        const bIndex = tableHeaders.indexOf(b);
        return aIndex - bIndex;
      });
    }

    return ids;
  }, [children, tableHeaders]);
}
