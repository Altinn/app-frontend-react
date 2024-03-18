import type { ILayoutSet } from 'src/layout/common.generated';
import type { CompInternal, IDataModelBindings } from 'src/layout/layout';

export const GLOBAL_INDEX_KEY_INDICATOR_REGEX = /\[{\d+}]/g;

export function getKeyWithoutIndex(keyWithIndex: string): string {
  if (keyWithIndex?.indexOf('[') === -1) {
    return keyWithIndex;
  }

  return getKeyWithoutIndex(
    keyWithIndex.substring(0, keyWithIndex.indexOf('[')) + keyWithIndex.substring(keyWithIndex.indexOf(']') + 1),
  );
}

export function getBaseDataModelBindings(
  dataModelBindings: IDataModelBindings | undefined,
): IDataModelBindings | undefined {
  if (typeof dataModelBindings === 'undefined') {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(dataModelBindings).map(([bindingKey, field]) => [bindingKey, getKeyWithoutIndex(field)]),
  );
}

export function getKeyWithoutIndexIndicators(keyWithIndexIndicators: string): string {
  return keyWithIndexIndicators.replaceAll(GLOBAL_INDEX_KEY_INDICATOR_REGEX, '');
}

/**
 * Returns key indexes:
 *
 * MyForm.Group[0].SubGroup[1]
 *              ^           ^
 *
 * as an array => [0, 1]
 */
export function getKeyIndex(keyWithIndex: string): number[] {
  const match = keyWithIndex.match(/\[\d+]/g) || [];
  return match.map((n) => parseInt(n.replace('[', '').replace(']', ''), 10));
}

/**
 * Mutates the data model bindings to convert from string representation with implicit data type to object with explicit data type
 */
export function resolveDataModelBindings<Item extends CompInternal = CompInternal>(
  item: Item,
  currentLayoutSet: ILayoutSet | null,
) {
  if (!currentLayoutSet) {
    window.logErrorOnce('Failed to resolve dataModelBindings, layout set not found');
    return;
  }

  if (item.dataModelBindings) {
    const dataType = currentLayoutSet.dataType;
    for (const [bindingKey, binding] of Object.entries(item.dataModelBindings)) {
      if (typeof binding === 'string') {
        item.dataModelBindings[bindingKey] = { dataType, property: binding };
      }
    }
  }
}
