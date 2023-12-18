import type {
  CompGroupExternal,
  CompGroupInternal,
  CompGroupNonRepeatingExternal,
  CompGroupNonRepeatingInternal,
  CompGroupNonRepeatingPanelExternal,
  CompGroupNonRepeatingPanelInternal,
} from 'src/layout/Group/config.generated';

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
