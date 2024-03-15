import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { CompAccordionGroupInternal } from 'src/layout/AccordionGroup/config.generated';
import type { HierarchyDataSources, ParentNode } from 'src/layout/layout';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export class AccordionGroupNode extends BaseLayoutNode<CompAccordionGroupInternal, 'AccordionGroup'> {
  constructor(
    item: CompAccordionGroupInternal,
    parent: ParentNode,
    top: LayoutPage,
    dataSources: HierarchyDataSources,
    rowIndex?: number,
    rowId?: string,
  ) {
    super(item, parent, top, dataSources, rowIndex, rowId);
  }
}
