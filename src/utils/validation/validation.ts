import { groupIsRepeatingExt } from 'src/layout/Group/tools';
import type { CompGroupExternal } from 'src/layout/Group/config.generated';
import type { ILayout } from 'src/layout/layout';

/**
 * @deprecated
 * @see useExprContext
 * @see useResolvedNode
 * @see ResolvedNodesSelector
 */
export function getParentGroup(groupId: string, layout: ILayout): CompGroupExternal | undefined {
  if (!groupId || !layout) {
    return undefined;
  }
  return layout.find((element) => {
    if (element.id !== groupId && element.type === 'Group') {
      const childrenWithoutMultiPage = element.children?.map((childId) =>
        groupIsRepeatingExt(element) && element.edit?.multiPage ? childId.split(':')[1] : childId,
      );
      if (childrenWithoutMultiPage?.indexOf(groupId) > -1) {
        return true;
      }
    }
    return false;
  }) as CompGroupExternal | undefined;
}
