import {
  getBaseGroupDataModelBindingFromKeyWithIndexIndicators,
  getIndexCombinations,
  keyHasIndexIndicators,
  replaceIndexIndicatorsWithIndexes,
} from 'src/utils/databindings';
import type { IFormData } from 'src/features/form/data';
import type { IAppListsMetaData, IAppListSource, IMapping, IRepeatingGroups } from 'src/types';

interface IGetAppListLookupKeysParam extends IAppListsMetaData {
  repeatingGroups: IRepeatingGroups;
}

interface IAppListLookupKeys {
  keys: IAppListsMetaData[];
  keyWithIndexIndicator?: IAppListsMetaData;
}

export function getAppListLookupKey({ id, mapping }: IAppListsMetaData) {
  if (!mapping) {
    return id;
  }

  return JSON.stringify({ id, mapping });
}

export function getAppListLookupKeys({
  id,
  mapping,
  secure,
  repeatingGroups,
}: IGetAppListLookupKeysParam): IAppListLookupKeys {
  const lookupKeys: IAppListsMetaData[] = [];

  const mappingsWithIndexIndicators = Object.keys(mapping || {}).filter((key) => keyHasIndexIndicators(key));
  if (mappingsWithIndexIndicators.length) {
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
        lookupKeys.push({ id, mapping: newMapping, secure });
      }
    });

    return {
      keys: lookupKeys,
      keyWithIndexIndicator: { id, mapping, secure },
    };
  }

  lookupKeys.push({ id, mapping, secure });
  return {
    keys: lookupKeys,
  };
}

export function getRelevantFormDataForAppListSource(formData: IFormData, source: IAppListSource) {
  const relevantFormData: IFormData = {};
  console.log('get relevant form data for option source');
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
