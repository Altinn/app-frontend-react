import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { ParentNode } from 'src/layout/layout';
import type { BaseRow, ItemStore } from 'src/utils/layout/types';

export class GroupNode extends BaseLayoutNode<'Group'> {
  constructor(store: ItemStore<'Group'>, parent: ParentNode, row?: BaseRow) {
    super(store, parent, row);
  }
}
