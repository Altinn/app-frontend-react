import type { IDataModelReference, ILayoutSet } from 'src/layout/common.generated';
import type { UnprocessedItem } from 'src/utils/layout/HierarchyGenerator';

export const GLOBAL_INDEX_KEY_INDICATOR_REGEX = /\[{\d+}]/g;

export function getKeyWithoutIndex(keyWithIndex: string): string {
  if (keyWithIndex?.indexOf('[') === -1) {
    return keyWithIndex;
  }

  return getKeyWithoutIndex(
    keyWithIndex.substring(0, keyWithIndex.indexOf('[')) + keyWithIndex.substring(keyWithIndex.indexOf(']') + 1),
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

export function isDataModelReference(binding: unknown): binding is IDataModelReference {
  return (
    typeof binding === 'object' &&
    binding != null &&
    !Array.isArray(binding) &&
    'field' in binding &&
    typeof binding.field === 'string' &&
    'dataType' in binding &&
    typeof binding.dataType === 'string'
  );
}

/**
 * Mutates the data model bindings to convert from string representation with implicit data type to object with explicit data type
 */
export function resolveDataModelBindings<Item extends UnprocessedItem = UnprocessedItem>(
  item: Item,
  currentLayoutSet: ILayoutSet | null,
) {
  if (!currentLayoutSet) {
    window.logErrorOnce('Failed to resolve dataModelBindings, layout set not found');
    return;
  }

  if ('dataModelBindings' in item && item.dataModelBindings) {
    const dataType = currentLayoutSet.dataType;
    for (const [bindingKey, binding] of Object.entries(item.dataModelBindings)) {
      if (typeof binding === 'string') {
        item.dataModelBindings[bindingKey] = { dataType, field: binding };
      }
    }
  }
}
