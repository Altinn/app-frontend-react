import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';

import { useApplicationMetadataQuery } from 'src/hooks/queries/useApplicationMetadataQuery';
import { useApplicationSettingsQuery } from 'src/hooks/queries/useApplicationSettingsQuery';
import { useCurrentInstanceQuery } from 'src/hooks/queries/useCurrentInstanceQuery';
import { useFormDataQuery } from 'src/hooks/queries/useFormdataQuery';
import { useGetOptionsQuery } from 'src/hooks/queries/useGetOptionsQuery';
import { useLayoutSetsQuery } from 'src/hooks/queries/useLayoutSetsQuery';
import { useLayoutsQuery } from 'src/hooks/queries/useLayoutsQuery';
import { useRepeatingGroupsQuery } from 'src/hooks/queries/useRepeatingGroupsQuery';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useStateDeepEqual } from 'src/hooks/useStateDeepEqual';
import { getCurrentTaskDataElementId, getLayoutSetIdForApplication } from 'src/utils/appMetadata';
import { convertModelToDataBinding } from 'src/utils/databindings';
import { buildInstanceContext } from 'src/utils/instanceContext';
import { getRelevantFormDataForOptionSource, setupSourceOptions } from 'src/utils/options';
import type { IMapping, IOption, IOptionSource } from 'src/layout/common.generated';
import type { ITextResource } from 'src/types';
import type { IDataSources } from 'src/types/shared';

interface IUseGetOptionsParams {
  optionsId: string | undefined;
  mapping?: IMapping;
  queryParameters?: Record<string, string>;
  secure?: boolean;
  source?: IOptionSource;
}

export interface IOptionResources {
  label?: ITextResource;
  description?: ITextResource;
  helpText?: ITextResource;
}

export const useGetOptions = ({ optionsId, mapping, queryParameters, secure, source }: IUseGetOptionsParams) => {
  const [options, setOptions] = useStateDeepEqual<IOption[] | undefined>(undefined);
  const { instanceId } = window;
  const { data: instance } = useCurrentInstanceQuery(instanceId || '', !!instanceId);
  const { data: applicationMetadata } = useApplicationMetadataQuery();
  const { data: applicationSettings } = useApplicationSettingsQuery();
  const { data: layoutSets } = useLayoutSetsQuery();

  const currentTaskDataElementId = getCurrentTaskDataElementId(
    applicationMetadata || null,
    instance || null,
    layoutSets || null,
  );
  const { data: fetchedFormData } = useFormDataQuery(
    instanceId || '',
    currentTaskDataElementId || '',
    !!currentTaskDataElementId && !!instanceId,
  );
  const formData = fetchedFormData && convertModelToDataBinding(fetchedFormData);

  const layoutSetId = getLayoutSetIdForApplication(applicationMetadata || null, instance, layoutSets);
  const { data: layouts } = useLayoutsQuery(layoutSetId || '', !!layoutSetId);
  const { data: repeatingGroups } = useRepeatingGroupsQuery(
    instanceId || '',
    currentTaskDataElementId || '',
    layouts || null,
    !!instanceId && !!currentTaskDataElementId && !!layouts,
  );

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

  const { data: fetchedOptions } = useGetOptionsQuery(
    instanceId || '',
    optionsId || '',
    formData,
    mapping,
    queryParameters,
    secure,
    !!instanceId && !!optionsId && !!formData,
  );

  useEffect(() => {
    if (fetchedOptions) {
      setOptions(fetchedOptions);
    }

    if (!source || !repeatingGroups || !relevantTextResources.label) {
      return;
    }

    const relevantFormData = (formData && getRelevantFormDataForOptionSource(formData, source)) || {};
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
    instance,
    repeatingGroups,
    source,
    relevantTextResources.label,
    relevantTextResources.description,
    relevantTextResources.helpText,
    fetchedOptions,
    formData,
    setOptions,
  ]);
  return options;
};
