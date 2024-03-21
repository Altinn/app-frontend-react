import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { ParentNode } from 'src/layout/layout';
import type { BaseRow, ItemStore } from 'src/utils/layout/types';

export class ButtonGroupNode extends BaseLayoutNode<'ButtonGroup'> {
  constructor(store: ItemStore<'ButtonGroup'>, parent: ParentNode, row?: BaseRow) {
    super(store, parent, row);
  }
}
