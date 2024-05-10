import deepEqual from 'fast-deep-equal';

export function shouldUpdate(currentList: Set<string>, newList: Set<string>): boolean {
  if (currentList.size !== newList.size) {
    return true;
  }

  const present = [...currentList.values()].sort();
  const future = [...newList.values()].sort();

  return !deepEqual(present, future);
}
