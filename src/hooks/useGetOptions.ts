import { useEffect, useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { useSourceOptions } from 'src/hooks/useSourceOptions';
import { buildInstanceContext } from 'src/utils/instanceContext';
import { getOptionLookupKey, getRelevantFormDataForOptionSource, setupSourceOptions } from 'src/utils/options';
import type { IMapping, IOption, IOptionSource } from 'src/layout/common.generated';
import type { IDataSources, ITextResource } from 'src/types/shared';

interface IUseGetOptionsParams {
  optionsId: string | undefined;
  mapping?: IMapping;
  queryParameters?: Record<string, string>;
  source?: IOptionSource;
}

export interface IOptionResources {
  label?: ITextResource;
  description?: ITextResource;
  helpText?: ITextResource;
}

export const useGetOptions = ({ optionsId, mapping, queryParameters, source }: IUseGetOptionsParams) => {
  const relevantFormData = useAppSelector(
    (state) => (source && getRelevantFormDataForOptionSource(state.formData.formData, source)) || {},
    shallowEqual,
  );
  const instance = useAppSelector((state) => state.instanceData.instance);

  const relevantTextResources: IOptionResources = useAppSelector((state) => {
    const { label, description, helpText } = source || {};
    const resources = state.textResources.resourceMap;
    return {
      label: label ? resources[label] : undefined,
      description: description ? resources[description] : undefined,
      helpText: helpText ? resources[helpText] : undefined,
    };
  }, shallowEqual);

  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const applicationSettings = useAppSelector((state) => state.applicationSettings?.applicationSettings);
  const optionState = useAppSelector((state) => state.optionState.options);
  const [options, setOptions] = useState<IOption[] | undefined>(undefined);

  const instanceContext = buildInstanceContext(instance);
  const dataSources: IDataSources = useMemo(
    () => ({
      dataModel: relevantFormData,
      applicationSettings,
      instanceContext,
    }),
    [relevantFormData, applicationSettings, instanceContext],
  );
  const sourceOptions = useSourceOptions({ source, dataSources, repeatingGroups, relevantTextResources });

  console.log('SourceOptions: ', sourceOptions);

  useEffect(() => {
    if (optionsId) {
      const key = getOptionLookupKey({ id: optionsId, mapping, fixedQueryParameters: queryParameters });
      setOptions(optionState[key]?.options);
    }

    if (!source || !repeatingGroups || !relevantTextResources.label) {
      return;
    }

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
    instanceContext,
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
    relevantTextResources,
    queryParameters,
  ]);

  return options;
};
