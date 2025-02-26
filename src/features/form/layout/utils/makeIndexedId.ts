import type { LayoutLookups } from 'src/features/form/layout/makeLayoutLookups';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { CompExternal, CompTypes } from 'src/layout/layout';

const repeatingComponents = ['RepeatingGroup', 'Likert'] as const satisfies CompTypes[];
type Repeating = (typeof repeatingComponents)[number];

export function makeIndexedId(
  subjectId: string,
  currentDataModelPath: IDataModelReference | undefined,
  lookups: LayoutLookups,
) {
  if (!currentDataModelPath) {
    return isInsideRepeatingComponent(subjectId, lookups) ? undefined : subjectId;
  }

  const path = currentDataModelPath.field;
  if (!path) {
    return subjectId;
  }

  const indices = extractIndicesFromPath(path);
  if (!indices || indices.length === 0) {
    return subjectId;
  }

  const repeating = findRepeatingParents(subjectId, path, lookups);
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

function extractIndicesFromPath(path: string): number[] | undefined {
  return path.match(/\[(\d+)]/g)?.map((match) => parseInt(match.slice(1, -1)));
}

function findRepeatingParents(subjectId: string, path: string, lookups: LayoutLookups): string[] | undefined {
  const repeating: string[] = [];
  let current = lookups.componentToParent[subjectId];
  while (current && current.type === 'node') {
    const parent = lookups.allComponents[current.id];
    if (isRepeatingComponent(parent)) {
      const parentBinding = getGroupBinding(parent);
      if (!parentBinding || !path.startsWith(parentBinding.field.split('[')[0])) {
        return undefined;
      }
      repeating.push(current.id);
    }
    current = lookups.componentToParent[current.id];
  }
  return repeating;
}

function isRepeatingComponent(component: unknown): component is CompExternal<Repeating> {
  return (
    !!component &&
    typeof component === 'object' &&
    'type' in component &&
    typeof component.type === 'string' &&
    repeatingComponents.includes(component.type as Repeating)
  );
}

function getGroupBinding(component: CompExternal<Repeating>): IDataModelReference | undefined {
  switch (component.type) {
    case 'RepeatingGroup':
      return component.dataModelBindings?.group;
    case 'Likert':
      return component.dataModelBindings?.questions;
    default:
      throw new Error(`Unexpected repeating component type`);
  }
}
