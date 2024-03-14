import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { CompButtonGroupInternal } from 'src/layout/ButtonGroup/config.generated';
import type { HierarchyDataSources, ParentNode } from 'src/layout/layout';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export class ButtonGroupNode extends BaseLayoutNode<CompButtonGroupInternal, 'ButtonGroup'> {
  constructor(
    item: CompButtonGroupInternal,
    parent: ParentNode,
    top: LayoutPage,
    dataSources: HierarchyDataSources,
    rowIndex?: number,
    rowId?: string,
  ) {
    super(item, parent, top, dataSources, rowIndex, rowId);
  }
}
