import { getRepeatingBinding, isRepeatingComponent } from 'src/features/form/layout/utils/repeating';
import type { LayoutLookups } from 'src/features/form/layout/makeLayoutLookups';
import type { IDataModelReference } from 'src/layout/common.generated';

export function makeIndexedId(
  subjectId: string,
  currentDataModelPath: IDataModelReference | undefined,
  lookups: LayoutLookups,
) {
  if (!currentDataModelPath) {
    return isInsideRepeatingComponent(subjectId, lookups) ? undefined : subjectId;
  }

  const indices = extractIndicesFromPath(currentDataModelPath);
  if (!indices || indices.length === 0) {
    return subjectId;
  }

  const repeating = findRepeatingParents(subjectId, currentDataModelPath, lookups);
  if (!repeating) {
    return undefined; // Inside a repeating component, but not related to the current path
  }
  if (repeating.length === 0) {
    return subjectId;
  }

  if (indices.length < repeating.length) {
    return undefined;
  }

  const relevantIndices = indices.slice(0, repeating.length);
  return `${subjectId}-${relevantIndices.join('-')}`;
}

function isInsideRepeatingComponent(subjectId: string, lookups: LayoutLookups): boolean {
  let current = lookups.componentToParent[subjectId];
  while (current && current.type === 'node') {
    const parent = lookups.allComponents[current.id];
    if (isRepeatingComponent(parent)) {
      return true;
    }
    current = lookups.componentToParent[current.id];
  }
  return false;
}

function extractIndicesFromPath(binding: IDataModelReference): number[] | undefined {
  return binding.field.match(/\[(\d+)]/g)?.map((match) => parseInt(match.slice(1, -1)));
}

function findRepeatingParents(
  subjectId: string,
  binding: IDataModelReference,
  lookups: LayoutLookups,
): string[] | undefined {
  const repeating: string[] = [];
  let current = lookups.componentToParent[subjectId];
  while (current && current.type === 'node') {
    const parent = lookups.allComponents[current.id];
    if (isRepeatingComponent(parent)) {
      const parentBinding = getRepeatingBinding(parent.type, parent.dataModelBindings);
      if (!parentBinding) {
        return undefined;
      }
      if (parentBinding.dataType !== binding.dataType) {
        return undefined;
      }
      const parentWithoutIndexes = parentBinding.field.replaceAll(/\[\d+]/g, '');
      const bindingWithoutIndexes = binding.field.replaceAll(/\[\d+]/g, '');
      if (
        bindingWithoutIndexes !== parentWithoutIndexes &&
        !bindingWithoutIndexes.startsWith(`${parentWithoutIndexes}.`)
      ) {
        return undefined;
      }
      repeating.push(current.id);
    }
    current = lookups.componentToParent[current.id];
  }
  return repeating;
}
