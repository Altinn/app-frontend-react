import {
  getBaseGroupDataModelBindingFromKeyWithIndexIndicators,
  getIndexes,
  keyHasIndexIndicators,
  replaceIndexIndicatorsWithIndexes,
} from 'src/utils/databindings';
import type { IFormData } from 'src/features/form/data';
import type {
  IMapping,
  IOption,
  IOptionSource,
  IRepeatingGroups,
  ITextResource,
} from 'src/types';

import { replaceTextResourceParams } from 'altinn-shared/utils';
import type { IDataSources } from 'altinn-shared/types';

interface IOptionObject {
  id: string;
  mapping?: IMapping;
  secure?: boolean;
}

export function getOptionLookupKey({ id, mapping }: IOptionObject) {
  if (!mapping) {
    return id;
  }

  return JSON.stringify({ id, mapping });
}

interface IGetOptionLookupKeysParam extends IOptionObject {
  repeatingGroups: IRepeatingGroups;
}

interface IOptionLookupKeys {
  keys: IOptionObject[];
  keyWithIndexIndicator?: IOptionObject;
}

export function getOptionLookupKeys({
  id,
  mapping,
  secure,
  repeatingGroups,
}: IGetOptionLookupKeysParam): IOptionLookupKeys {
  const lookupKeys: IOptionObject[] = [];

  const mappingsWithIndexIndicators = Object.keys(mapping || {}).filter((key) =>
    keyHasIndexIndicators(key),
  );

  if (mappingsWithIndexIndicators.length) {
    // create lookup keys for each index of the relevant repeating group
    mappingsWithIndexIndicators.forEach((mappingKey) => {
      const baseGroupBindings =
        getBaseGroupDataModelBindingFromKeyWithIndexIndicators(mappingKey);
      const groupIndexes = baseGroupBindings
        .map<number>((binding) => {
          return Object.values(repeatingGroups || {}).find(
            (group) => group.dataModelBinding === binding,
          )?.index;
        })
        .filter((index) => index !== undefined);
      const possibleCombinations = getIndexes(groupIndexes);
      for (let index = 0; index < possibleCombinations.length; index++) {
        const newMappingKey = replaceIndexIndicatorsWithIndexes(
          mappingKey,
          possibleCombinations[index],
        );
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

export function replaceOptionDataField(
  formData: IFormData,
  valueString: string,
  index: number,
) {
  const indexedValueString = valueString.replace('{0}', index.toString());
  return formData[indexedValueString];
}

export function getRelevantFormDataForOptionSource(
  formData: IFormData,
  source: IOptionSource,
) {
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

interface ISetupSourceOptionsParams {
  source: IOptionSource;
  relevantTextResource: ITextResource;
  relevantFormData: IFormData;
  repeatingGroups: IRepeatingGroups;
  dataSources: IDataSources;
}

export function setupSourceOptions({
  source,
  relevantTextResource,
  relevantFormData,
  repeatingGroups,
  dataSources,
}: ISetupSourceOptionsParams) {
  const replacedOptionLabels = replaceTextResourceParams(
    [relevantTextResource],
    dataSources,
    repeatingGroups,
  );

  const repGroup = Object.values(repeatingGroups).find((group) => {
    return group.dataModelBinding === source.group;
  });

  const options: IOption[] = [];
  for (let i = 0; i <= repGroup.index; i++) {
    const option: IOption = {
      label: replacedOptionLabels[i + 1].value,
      value: replaceOptionDataField(relevantFormData, source.value, i),
    };
    options.push(option);
  }
  return options;
}
