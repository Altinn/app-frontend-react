import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  CompGroupExternal,
  CompGroupInternal,
  CompGroupNonRepeatingExternal,
  CompGroupNonRepeatingInternal,
  CompGroupNonRepeatingPanelExternal,
  CompGroupNonRepeatingPanelInternal,
  CompGroupRepeatingExternal,
  CompGroupRepeatingInternal,
  CompGroupRepeatingLikertExternal,
  CompGroupRepeatingLikertInternal,
} from 'src/layout/Group/config.generated';

export class LayoutNodeForGroup<T extends CompGroupInternal = CompGroupInternal> extends BaseLayoutNode<T, 'Group'> {
  public isRepGroup(): this is LayoutNodeForGroup<CompGroupRepeatingInternal> {
    return groupIsRepeating(this.item);
  }

  public isNonRepGroup(): this is LayoutNodeForGroup<CompGroupNonRepeatingInternal> {
    return groupIsNonRepeating(this.item);
  }

  public isNonRepPanelGroup(): this is LayoutNodeForGroup<CompGroupNonRepeatingPanelInternal> {
    return groupIsNonRepeatingPanel(this.item);
  }

  public isRepGroupLikert(): this is LayoutNodeForGroup<CompGroupRepeatingLikertInternal> {
    return groupIsRepeatingLikert(this.item);
  }
}

export function groupIsRepeating(item: CompGroupInternal): item is CompGroupRepeatingInternal {
  return typeof item.maxCount === 'number' && item.maxCount > 1;
}

export function groupIsRepeatingExt(item: CompGroupExternal): item is CompGroupRepeatingExternal {
  return typeof item.maxCount === 'number' && item.maxCount > 1;
}

export function groupIsNonRepeating(item: CompGroupInternal): item is CompGroupNonRepeatingInternal {
  if ('panel' in item) {
    return false;
  }

  return !item.maxCount || item.maxCount <= 1;
}

// eslint-disable-next-line sonarjs/no-identical-functions
export function groupIsNonRepeatingExt(item: CompGroupExternal): item is CompGroupNonRepeatingExternal {
  if ('panel' in item) {
    return false;
  }

  return !item.maxCount || item.maxCount <= 1;
}

export function groupIsNonRepeatingPanel(item: CompGroupInternal): item is CompGroupNonRepeatingPanelInternal {
  if (!item.maxCount || item.maxCount <= 1) {
    return 'panel' in item;
  }

  return false;
}

// eslint-disable-next-line sonarjs/no-identical-functions
export function groupIsNonRepeatingPanelExt(item: CompGroupExternal): item is CompGroupNonRepeatingPanelExternal {
  if (!item.maxCount || item.maxCount <= 1) {
    return 'panel' in item;
  }

  return false;
}

export function groupIsRepeatingLikert(item: CompGroupInternal): item is CompGroupRepeatingLikertInternal {
  if (typeof item.maxCount === 'number' && item.maxCount > 1 && 'edit' in item) {
    return item.edit?.mode === 'likert';
  }

  return false;
}

// eslint-disable-next-line sonarjs/no-identical-functions
export function groupIsRepeatingLikertExt(item: CompGroupExternal): item is CompGroupRepeatingLikertExternal {
  if (typeof item.maxCount === 'number' && item.maxCount > 1 && 'edit' in item) {
    return item.edit?.mode === 'likert';
  }

  return false;
}
