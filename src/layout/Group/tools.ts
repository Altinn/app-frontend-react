import type {
  CompGroupExternal,
  CompGroupInternal,
  CompGroupNonRepeatingExternal,
  CompGroupNonRepeatingInternal,
} from 'src/layout/Group/config.generated';

export function groupIsNonRepeating(item: CompGroupInternal): item is CompGroupNonRepeatingInternal {
  return true;
}

export function groupIsNonRepeatingExt(item: CompGroupExternal): item is CompGroupNonRepeatingExternal {
  return true;
}
