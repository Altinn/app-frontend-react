import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { ParentNode } from 'src/layout/layout';
import type { BaseRow, ItemStore } from 'src/utils/layout/types';

export class AccordionGroupNode extends BaseLayoutNode<'AccordionGroup'> {
  constructor(store: ItemStore<'AccordionGroup'>, parent: ParentNode, row?: BaseRow) {
    super(store, parent, row);
  }
}
