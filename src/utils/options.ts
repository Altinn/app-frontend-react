import {
  getBaseGroupDataModelBindingFromKeyWithIndexIndicators,
  getGroupDataModelBinding,
  getIndexCombinations,
  keyHasIndexIndicators,
  replaceIndexIndicatorsWithIndexes,
} from 'src/utils/databindings';
import type { IFormData } from 'src/features/formData';
import type { IMapping, IOption, IOptionSource } from 'src/layout/common.generated';
import type { ILayout } from 'src/layout/layout';
import type { IOptions, IOptionsMetaData, IRepeatingGroups } from 'src/types';

export function getOptionLookupKey({ id, mapping, fixedQueryParameters }: IOptionsMetaData) {
  if (!mapping && !fixedQueryParameters) {
    return id;
  }

  const keyObject: any = { id };
  if (mapping) {
    keyObject.mapping = mapping;
  }
  if (fixedQueryParameters) {
    keyObject.fixedQueryParameters = fixedQueryParameters;
  }
  return JSON.stringify(keyObject);
}

interface IGetOptionLookupKeysParam extends IOptionsMetaData {
  repeatingGroups: IRepeatingGroups;
}

interface IOptionLookupKeys {
  keys: IOptionsMetaData[];
  keyWithIndexIndicator?: IOptionsMetaData;
}

export function getOptionLookupKeys({
  id,
  mapping,
  fixedQueryParameters,
  secure,
  repeatingGroups,
}: IGetOptionLookupKeysParam): IOptionLookupKeys {
  const lookupKeys: IOptionsMetaData[] = [];

  const mappingsWithIndexIndicators = Object.keys(mapping || {}).filter((key) => keyHasIndexIndicators(key));

  if (mappingsWithIndexIndicators.length && mapping) {
    // create lookup keys for each index of the relevant repeating group
    mappingsWithIndexIndicators.forEach((mappingKey) => {
      const baseGroupBindings = getBaseGroupDataModelBindingFromKeyWithIndexIndicators(mappingKey);
      const possibleCombinations = getIndexCombinations(baseGroupBindings, repeatingGroups);
      for (const possibleCombination of possibleCombinations) {
        const newMappingKey = replaceIndexIndicatorsWithIndexes(mappingKey, possibleCombination);
        const newMapping: IMapping = {
          ...mapping,
        };
        delete newMapping[mappingKey];
        newMapping[newMappingKey] = mapping[mappingKey];
        lookupKeys.push({ id, mapping: newMapping, fixedQueryParameters, secure });
      }
    });

    return {
      keys: lookupKeys,
      keyWithIndexIndicator: { id, mapping, fixedQueryParameters, secure },
    };
  }

  lookupKeys.push({ id, mapping, fixedQueryParameters, secure });
  return {
    keys: lookupKeys,
  };
}

export function getRelevantFormDataForOptionSource(formData: IFormData, source: IOptionSource) {
  const relevantFormData: IFormData = {};

  if (!formData || !source) {
    return relevantFormData;
  }

  Object.keys(formData).forEach((key) => {
    if (key.includes(source.group)) {
      relevantFormData[key] = formData[key];
    }
  });

  return relevantFormData;
}

interface IRemoveGroupOptionsByIndexParams {
  groupId: string;
  index: number;
  repeatingGroups: IRepeatingGroups;
  options: IOptions;
  layout: ILayout;
}
export function removeGroupOptionsByIndex({
  groupId,
  index,
  repeatingGroups,
  options,
  layout,
}: IRemoveGroupOptionsByIndexParams) {
  const newOptions: IOptions = {};
  const repeatingGroup = repeatingGroups[groupId];
  const groupDataBinding = getGroupDataModelBinding(repeatingGroup, groupId, layout);

  Object.keys(options || {}).forEach((optionKey) => {
    const { mapping, id } = options[optionKey] || {};
    if (id === undefined) {
      return;
    }

    if (!mapping) {
      newOptions[optionKey] = options[optionKey];
      return;
    }
    const shouldBeDeleted = Object.keys(mapping).some((mappingKey) =>
      mappingKey.startsWith(`${groupDataBinding}[${index}]`),
    );

    if (shouldBeDeleted) {
      return;
    }

    let newMapping;
    if (index <= repeatingGroup.index) {
      newMapping = {
        ...mapping,
      };
      // the indexed to be deleted is lower than total indexes, shift all above
      for (let shiftIndex = index + 1; shiftIndex <= repeatingGroup.index + 1; shiftIndex++) {
        const shouldBeShifted = Object.keys(mapping).filter((mappingKey) =>
          mappingKey.startsWith(`${groupDataBinding}[${shiftIndex}]`),
        );

        shouldBeShifted?.forEach((key) => {
          const newKey = key.replace(`${groupDataBinding}[${shiftIndex}]`, `${groupDataBinding}[${shiftIndex - 1}]`);
          delete newMapping[key];
          newMapping[newKey] = mapping[key];
        });
      }
    }

    const newOptionsKey = getOptionLookupKey({ id, mapping: newMapping });

    newOptions[newOptionsKey] = {
      ...options[optionKey],
      id,
      mapping: newMapping,
    };
  });

  return newOptions;
}

export function duplicateOptionFilter(currentOption: IOption, currentIndex: number, options: IOption[]): boolean {
  for (let i = 0; i < currentIndex; i++) {
    if (currentOption.value === options[i].value) {
      return false;
    }
  }
  return true;
}
