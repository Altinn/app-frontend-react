import { validateDataModelBindingsAny } from 'src/utils/layout/generator/validation/hooks';
import type { DataModels } from 'src/features/datamodel/DataModelsProvider';
import type { LayoutLookups } from 'src/features/form/layout/makeLayoutLookups';
import type { OptionsValueType } from 'src/features/options/useGetOptions';
import type { IDataModelBindings } from 'src/layout/layout';

export function validateOptionsDataModelBindings<
  T extends 'Dropdown' | 'RadioButtons' | 'LikertItem' | 'Checkboxes' | 'MultipleSelect',
>(
  baseComponentId: string,
  bindings: IDataModelBindings<T> | undefined,
  lookupBinding: ReturnType<(typeof DataModels)['useLookupBinding']>,
  layoutLookups: LayoutLookups,
  valueType: OptionsValueType,
): string[] {
  if (!bindings) {
    return [];
  }
  const [metadataErrors] = validateDataModelBindingsAny(
    baseComponentId,
    bindings,
    lookupBinding,
    layoutLookups,
    'metadata',
    ['string'],
    false,
  );
  const [labelErrors, labelSchema] = validateDataModelBindingsAny(
    baseComponentId,
    bindings,
    lookupBinding,
    layoutLookups,
    'label',
    valueType === 'multi' ? ['array'] : ['string'],
    false,
  );
  const errors = [...(metadataErrors ?? []), ...(labelErrors ?? [])];

  if (valueType === 'multi' && labelSchema) {
    const items = labelSchema.items;
    const itemType = items && typeof items === 'object' && !Array.isArray(items) ? items.type : undefined;
    const itemTypes = Array.isArray(itemType) ? itemType.filter((type) => type !== 'null') : [itemType];
    if (itemTypes.length !== 1 || itemTypes[0] !== 'string') {
      errors.push('label-datamodellbindingen må peke på en liste med strenger (string[])');
    }
  }

  return errors;
}
