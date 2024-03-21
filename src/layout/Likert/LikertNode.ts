import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { ParentNode } from 'src/layout/layout';
import type { BaseRow, ItemStore } from 'src/utils/layout/types';

export class LikertNode extends BaseLayoutNode<'Likert'> {
  constructor(store: ItemStore<'Likert'>, parent: ParentNode, row?: BaseRow) {
    super(store, parent, row);
  }
}
