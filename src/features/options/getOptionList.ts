import { getOptionLookupKey, getRelevantFormDataForOptionSource, setupSourceOptions } from 'src/utils/options';
import type { IFormData } from 'src/features/formData';
import type { TextResourceMap } from 'src/features/textResources';
import type { IOption, ISelectionComponent } from 'src/layout/common.generated';
import type { IOptions, IRepeatingGroups } from 'src/types';

export function getOptionList(
  component: ISelectionComponent,
  textResources: TextResourceMap,
  formData: IFormData,
  repeatingGroups: IRepeatingGroups | null,
  options: IOptions,
): IOption[] {
  if (component.options) {
    return component.options;
  }
  if (component.optionsId) {
    const key = getOptionLookupKey({
      id: component.optionsId,
      mapping: component.mapping,
    });
    return options[key]?.options || [];
  }
  if (component.source) {
    const relevantTextResourceLabel = textResources[component.source?.label];
    const reduxOptions =
      relevantTextResourceLabel &&
      setupSourceOptions({
        source: component.source,
        relevantTextResources: { label: relevantTextResourceLabel },
        relevantFormData: getRelevantFormDataForOptionSource(formData, component.source),
        repeatingGroups,
        dataSources: {
          dataModel: formData,
        },
      });
    return reduxOptions || [];
  }

  return [];
}
