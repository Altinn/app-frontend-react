import { getPatch } from 'fast-array-diff';
import deepEqual from 'fast-deep-equal';

import type { JsonPatch } from 'src/features/formData/jsonPatch/types';

interface Props<T> {
  prev: T;
  next: T;
}

interface CompareProps<T> extends Props<T> {
  patch: JsonPatch;
  path: string[];
  stats: Stats;
}

interface Stats {
  comparisons: number;
}

/**
 * This will create a JSON patch that can be used to update the previous object to the next object.
 * It will look for the most shallow changes possible, and will always add a 'test' operation before
 * changes that can be tested for. This should in theory also make the patch reversible, and will ensure
 * that the patch can be applied to the previous object without overwriting any changes that may have
 * been made to the previous object since the next object was created.
 */
export function createPatch({ prev, next }: Props<object>): JsonPatch {
  const patch: JsonPatch = [];
  if (!isObject(prev)) {
    throw new Error('prev must be an object');
  }
  if (!isObject(next)) {
    throw new Error('next must be an object');
  }

  const stats = newStats();
  compareObjects({ prev, next, patch, path: [], stats });
  return patch;
}

function newStats(): Stats {
  return {
    comparisons: 0,
  };
}

function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isScalarOrNull(value: any): value is string | number | boolean | null {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null;
}

function compareAny(props: CompareProps<any>) {
  const { prev, next } = props;
  if (isObject(prev) && isObject(next)) {
    compareObjects(props);
    return;
  }
  if (Array.isArray(prev) && Array.isArray(next)) {
    compareArrays(props);
    return;
  }
  compareValues(props);
}

function compareObjects({ prev, next, path, ...rest }: CompareProps<object>) {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of keys) {
    const prevValue = prev[key];
    const nextValue = next[key];
    compareAny({ prev: prevValue, next: nextValue, path: [...path, key], ...rest });
  }
}

/**
 * This comparison function is used to determine if two values in an array are similar enough to be considered
 * the same. This is used to determine if an item has been removed or added - or if it has been (slightly) changed and
 * the values within it should be compared individually instead.
 */
function isSimilarEnough(stats: Stats): (left: any, right: any) => boolean {
  return (left, right) => {
    stats.comparisons++;
    if (isObject(left) && isObject(right)) {
      const patch: JsonPatch = [];
      const innerStats = newStats();
      compareObjects({ prev: left, next: right, patch, path: [], stats: innerStats });
      const actualChanges = patch.filter((p) => p.op !== 'test').length;
      const numAdd = patch.filter((p) => p.op === 'add').length;
      const numRemove = patch.filter((p) => p.op === 'remove').length;
      const numReplace = patch.filter((p) => p.op === 'replace').length;

      if (numRemove === 0 && numReplace === 0 && numAdd > 0) {
        // If there are only added properties, we'll consider it similar enough that, and we can just add data
        // to the existing object.
        return true;
      }

      const potentialChanges = innerStats.comparisons;
      if (potentialChanges === 0 || actualChanges === 0) {
        return true;
      }
      const changedPercentage = actualChanges / potentialChanges;
      return changedPercentage < 0.6;
    }

    if (Array.isArray(left) && Array.isArray(right)) {
      return deepEqual(left, right);
    }

    return left === right;
  };
}

/**
 * When comparing arrays, some items may have been removed, some added, and some changed. In order to figure ou
 * which operation to choose, we need to do something a bit more complex than the code in this file. This uses
 * an LCS algorithm to figure out the longest common subsequence between the two arrays, and then uses that to
 * produce the JsonPatch to create. Do not be fooled by the format returned from getPatch, it is not a JsonPatch
 * even if it looks like it at a glance.
 */
function compareArrays({ prev, next, patch, path, stats }: CompareProps<any[]>) {
  const diff = getPatch(prev, next, isSimilarEnough(stats));
  const localPatch: JsonPatch = [];
  const arrayAfterChanges = [...prev];
  for (const part of diff) {
    const { type, newPos: nextPos, oldPos: prevPos, items } = part;
    if (type === 'add') {
      let nextIndex = nextPos;
      for (const item of items) {
        const isAppend = nextIndex === arrayAfterChanges.length;
        localPatch.push({ op: 'add', path: pointer([...path, isAppend ? '-' : String(nextIndex)]), value: item });
        if (isAppend) {
          arrayAfterChanges.push(item);
        } else {
          arrayAfterChanges.splice(nextIndex, 0, item);
        }
        nextIndex++;
      }
    } else if (type === 'remove') {
      // We'll count down instead of up so that we can remove the items from the end first, and then we won't have to
      // worry about the indices changing.
      let addToIndex = items.length - 1;
      for (const _item of items) {
        const oldIdx = prevPos + addToIndex--;
        localPatch.push({ op: 'remove', path: pointer([...path, String(oldIdx)]) });
        arrayAfterChanges.splice(oldIdx, 1);
      }
    }
  }

  if (localPatch.length) {
    let addTestFirst = true;
    if (localPatch.length === 1 && localPatch[0].op === 'add' && localPatch[0].path.endsWith('/-')) {
      // When appending to an array, and that's the only thing we do, we don't care about the previous value (as long
      // as we know it was an array - which was checked before we reached this function). This works around an issue
      // where backend replies with an error in some instances.
      // TODO: Remove this when backend is fixed.
      addTestFirst = false;
    }
    if (addTestFirst) {
      // Add a test first to make sure the original array is still the same as the one we're changing
      patch.push({ op: 'test', path: pointer(path), value: prev });
    }
    patch.push(...localPatch);
  }

  // We still have to compare items within the array, as the code above just checks if items within
  // are similar enough, it doesn't check that they're entirely equal.
  const childPatches: JsonPatch = [];
  for (const [index, prevItem] of arrayAfterChanges.entries()) {
    const nextItem = next[index];
    compareAny({ prev: prevItem, next: nextItem, patch: childPatches, path: [...path, String(index)], stats });
  }
  patch.push(...childPatches);
}

function compareValues({ prev, next, patch, path, stats }: CompareProps<any>) {
  stats.comparisons++;
  if (prev === next) {
    return;
  }
  if (next === undefined) {
    patch.push({ op: 'test', path: pointer(path), value: prev });
    patch.push({ op: 'remove', path: pointer(path) });
  } else if (prev === undefined) {
    patch.push({ op: 'add', path: pointer(path), value: next });
  } else if (!prev && Array.isArray(next)) {
    // Special-case workaround for an apparent backend bug where repeating groups will be set to null, and we'll
    // only be told the value is null, but as soon as we add an array here, backend will throw an error when our
    // test case does not match its representation. For that reason, we'll work around it by not sending a test.
    // TODO: Remove this when backend is fixed.
    patch.push({ op: 'replace', path: pointer(path), value: next });
  } else {
    patch.push({ op: 'test', path: pointer(path), value: prev });
    patch.push({ op: 'replace', path: pointer(path), value: next });
  }
}

function pointer(path: string[]) {
  return `/${path.join('/')}`;
}
