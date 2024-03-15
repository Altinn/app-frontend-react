import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { CompInternal, HierarchyDataSources, ParentNode } from 'src/layout/layout';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export class AccordionNode extends BaseLayoutNode<'Accordion'> {
  constructor(
    item: CompInternal<'Accordion'>,
    parent: ParentNode,
    top: LayoutPage,
    dataSources: HierarchyDataSources,
    rowIndex?: number,
    rowId?: string,
  ) {
    super(item, parent, top, dataSources, rowIndex, rowId);
  }
}
