import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  CompGroupInternal,
  CompGroupNonRepeatingInternal,
  CompGroupNonRepeatingPanelInternal,
  CompGroupRepeatingInternal,
  CompGroupRepeatingLikertInternal,
} from 'src/layout/Group/config.generated';

export class LayoutNodeForGroup<T extends CompGroupInternal = CompGroupInternal> extends BaseLayoutNode<T, 'Group'> {
  public isRepGroup(): this is LayoutNodeForGroup<CompGroupRepeatingInternal> {
    return typeof this.item.maxCount === 'number' && this.item.maxCount > 1;
  }

  public isNonRepGroup(): this is LayoutNodeForGroup<CompGroupNonRepeatingInternal> {
    if ('panel' in this.item) {
      return false;
    }

    return !this.item.maxCount || this.item.maxCount <= 1;
  }

  public isNonRepPanelGroup(): this is LayoutNodeForGroup<CompGroupNonRepeatingPanelInternal> {
    if (!this.item.maxCount || this.item.maxCount <= 1) {
      return 'panel' in this.item;
    }

    return false;
  }

  public isRepGroupLikert(): this is LayoutNodeForGroup<CompGroupRepeatingLikertInternal> {
    if (typeof this.item.maxCount === 'number' && this.item.maxCount > 1 && 'edit' in this.item) {
      return this.item.edit?.mode === 'likert';
    }

    return false;
  }
}
