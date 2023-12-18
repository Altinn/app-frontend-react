import { groupIsNonRepeating, groupIsNonRepeatingPanel } from 'src/layout/Group/tools';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  CompGroupInternal,
  CompGroupNonRepeatingInternal,
  CompGroupNonRepeatingPanelInternal,
} from 'src/layout/Group/config.generated';

export class LayoutNodeForGroup<T extends CompGroupInternal = CompGroupInternal> extends BaseLayoutNode<T, 'Group'> {
  public isNonRepGroup(): this is LayoutNodeForGroup<CompGroupNonRepeatingInternal> {
    return groupIsNonRepeating(this.item);
  }

  public isNonRepPanelGroup(): this is LayoutNodeForGroup<CompGroupNonRepeatingPanelInternal> {
    return groupIsNonRepeatingPanel(this.item);
  }
}
