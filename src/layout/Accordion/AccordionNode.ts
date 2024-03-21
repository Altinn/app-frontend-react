import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { ParentNode } from 'src/layout/layout';
import type { BaseRow, ItemStore } from 'src/utils/layout/types';

export class AccordionNode extends BaseLayoutNode<'Accordion'> {
  constructor(store: ItemStore<'Accordion'>, parent: ParentNode, row?: BaseRow) {
    super(store, parent, row);
  }
}
