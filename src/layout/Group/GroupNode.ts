import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { CompInternal, HierarchyDataSources, ParentNode } from 'src/layout/layout';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export class GroupNode extends BaseLayoutNode<'Group'> {
  constructor(
    item: CompInternal<'Group'>,
    parent: ParentNode,
    top: LayoutPage,
    dataSources: HierarchyDataSources,
    rowIndex?: number,
    rowId?: string,
  ) {
    super(item, parent, top, dataSources, rowIndex, rowId);
  }
}
