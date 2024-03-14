import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { CompGroupInternal } from 'src/layout/Group/config.generated';
import type { HierarchyDataSources, ParentNode } from 'src/layout/layout';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export class GroupNode extends BaseLayoutNode<CompGroupInternal, 'Group'> {
  constructor(
    item: CompGroupInternal,
    parent: ParentNode,
    top: LayoutPage,
    dataSources: HierarchyDataSources,
    rowIndex?: number,
    rowId?: string,
  ) {
    super(item, parent, top, dataSources, rowIndex, rowId);
  }
}
