import { groupIsNonRepeating } from 'src/layout/Group/tools';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { CompGroupInternal, CompGroupNonRepeatingInternal } from 'src/layout/Group/config.generated';

export class LayoutNodeForGroup<T extends CompGroupInternal = CompGroupInternal> extends BaseLayoutNode<T, 'Group'> {
  public isNonRepGroup(): this is LayoutNodeForGroup<CompGroupNonRepeatingInternal> {
    return groupIsNonRepeating(this.item);
  }
}
