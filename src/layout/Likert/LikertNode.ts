import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { HierarchyDataSources, ParentNode } from 'src/layout/layout';
import type { CompLikertInternal } from 'src/layout/Likert/config.generated';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export class LikertNode extends BaseLayoutNode<CompLikertInternal, 'Likert'> {
  constructor(
    item: CompLikertInternal,
    parent: ParentNode,
    top: LayoutPage,
    dataSources: HierarchyDataSources,
    rowIndex?: number,
    rowId?: string,
  ) {
    super(item, parent, top, dataSources, rowIndex, rowId);
  }
}
