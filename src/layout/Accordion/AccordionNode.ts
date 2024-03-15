import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { CompAccordionInternal } from 'src/layout/Accordion/config.generated';
import type { HierarchyDataSources, ParentNode } from 'src/layout/layout';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export class AccordionNode extends BaseLayoutNode<CompAccordionInternal, 'Accordion'> {
  constructor(
    item: CompAccordionInternal,
    parent: ParentNode,
    top: LayoutPage,
    dataSources: HierarchyDataSources,
    rowIndex?: number,
    rowId?: string,
  ) {
    super(item, parent, top, dataSources, rowIndex, rowId);
  }
}
