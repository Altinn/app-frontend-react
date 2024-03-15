import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { HierarchyDataSources, ParentNode } from 'src/layout/layout';
import type { CompRepeatingGroupInternal } from 'src/layout/RepeatingGroup/config.generated';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export class RepGroupNode extends BaseLayoutNode<CompRepeatingGroupInternal, 'RepeatingGroup'> {
  constructor(
    item: CompRepeatingGroupInternal,
    parent: ParentNode,
    top: LayoutPage,
    dataSources: HierarchyDataSources,
    rowIndex?: number,
    rowId?: string,
  ) {
    super(item, parent, top, dataSources, rowIndex, rowId);
  }
}
