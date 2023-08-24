import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';

import { useApplicationMetadataQuery } from 'src/hooks/queries/useApplicationMetadataQuery';
import { useApplicationSettingsQuery } from 'src/hooks/queries/useApplicationSettingsQuery';
import { useCurrentInstanceQuery } from 'src/hooks/queries/useCurrentInstanceQuery';
import { useFormDataQuery } from 'src/hooks/queries/useFormdataQuery';
import { useLayoutQuery } from 'src/hooks/queries/useLayoutQuery';
import { useLayoutSetsQuery } from 'src/hooks/queries/useLayoutSetsQuery';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { getCurrentTaskDataElementId, getLayoutSetIdForApplication } from 'src/utils/appMetadata';
import { convertModelToDataBinding } from 'src/utils/databindings';
import { buildInstanceContext } from 'src/utils/instanceContext';
import { getOptionLookupKey, getRelevantFormDataForOptionSource, setupSourceOptions } from 'src/utils/options';
import type { IMapping, IOption, IOptionSource, ITextResource } from 'src/types';
import type { IDataSources } from 'src/types/shared';

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
  const { instanceId } = window;
  const { data: instance } = useCurrentInstanceQuery(instanceId || '', !!instanceId);
  const { data: applicationMetadata } = useApplicationMetadataQuery();
  const { data: layoutSets } = useLayoutSetsQuery();
  console.log(layoutSets);
  const currentTaskDataElementId = getCurrentTaskDataElementId(
    applicationMetadata || null,
    instance || null,
    layoutSets || null,
  );
  const { data: fetchedFormData } = useFormDataQuery(
    instanceId || '',
    currentTaskDataElementId || '',
    !!currentTaskDataElementId,
  );

  const { data: applicationSettings } = useApplicationSettingsQuery();
  const formData = fetchedFormData && convertModelToDataBinding(fetchedFormData);

  const relevantTextResources: IOptionResources = useAppSelector((state) => {
    const { label, description, helpText } = source || {};
    const resources = state.textResources.resources;
    const findResourceById = (id?: string) => resources.find((resource) => resource.id === id);
    return {
      label: findResourceById(label),
      description: findResourceById(description),
      helpText: findResourceById(helpText),
    };
  }, shallowEqual);

  console.log(formData);

  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);

  const layoutSetId = getLayoutSetIdForApplication(applicationMetadata || null, instance, layoutSets);

  const { data: layoutSet } = useLayoutQuery(layoutSetId || '', !!layoutSetId);

  console.log(layoutSet);

  // for (const layoutId of Object.keys(layoutSet)) {
  //   console.log(layoutId);
  // }

  const optionState = useAppSelector((state) => state.optionState.options);

  const [options, setOptions] = useState<IOption[] | undefined>(undefined);

  useEffect(() => {
    if (optionsId) {
      const key = getOptionLookupKey({ id: optionsId, mapping, fixedQueryParameters: queryParameters });
      setOptions(optionState[key]?.options);
    }

    if (!source || !repeatingGroups || !relevantTextResources.label) {
      return;
    }

    const instanceContext = buildInstanceContext(instance);

    const dataSources: IDataSources = {
      dataModel: relevantFormData,
      applicationSettings: applicationSettings || {},
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
    queryParameters,
  ]);

  return options;
};
