import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { buildInstanceContext } from 'src/utils/instanceContext';
import { getOptionLookupKey, getRelevantFormDataForOptionSource, setupSourceOptions } from 'src/utils/options';
import type { IMapping, IOption, IOptionSource, ITextResource } from 'src/types';
import type { IDataSources } from 'src/types/shared';

interface IUseGetOptionsParams {
  optionsId: string | undefined;
  mapping?: IMapping;
  source?: IOptionSource;
}

export interface IOptionResources {
  label?: ITextResource;
  description?: ITextResource;
  helpText?: ITextResource;
}

export const useGetOptions = ({ optionsId, mapping, source }: IUseGetOptionsParams) => {
  const relevantFormData = useAppSelector(
    (state) => (source && getRelevantFormDataForOptionSource(state.formData.formData, source)) || {},
    shallowEqual,
  );
  const instance = useAppSelector((state) => state.instanceData.instance);
  const relevantTextResources: IOptionResources = useAppSelector((state) => {
    const resources = state.textResources.resources;
    return {
      label: source && resources.find((e) => e.id === source.label),
      description: source && resources.find((e) => e.id === source.description),
      helpText: source && resources.find((e) => e.id === source.helpText),
    };
  }, shallowEqual);
  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const applicationSettings = useAppSelector((state) => state.applicationSettings?.applicationSettings);
  const optionState = useAppSelector((state) => state.optionState.options);
  const [options, setOptions] = useState<IOption[] | undefined>(undefined);

  useEffect(() => {
    if (optionsId) {
      const key = getOptionLookupKey({ id: optionsId, mapping });
      setOptions(optionState[key]?.options);
    }

    if (!source || !repeatingGroups || !relevantTextResources.label) {
      return;
    }

    const instanceContext = buildInstanceContext(instance);

    const dataSources: IDataSources = {
      dataModel: relevantFormData,
      applicationSettings,
      instanceContext,
    };

    setOptions(
      setupSourceOptions({
        source,
        relevantTextResources: {
          label: relevantTextResources.label,
          description: relevantTextResources.description,
          helpText: relevantTextResources.helpText,
        },
        relevantFormData,
        repeatingGroups,
        dataSources,
      }),
    );
  }, [
    applicationSettings,
    optionsId,
    relevantFormData,
    instance,
    mapping,
    optionState,
    repeatingGroups,
    source,
    relevantTextResources.label,
    relevantTextResources.description,
    relevantTextResources.helpText,
  ]);

  return options;
};
