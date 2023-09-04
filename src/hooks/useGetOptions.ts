import { useEffect } from 'react';

import { useApplicationMetadataQuery } from 'src/hooks/queries/useApplicationMetadataQuery';
import { useApplicationSettingsQuery } from 'src/hooks/queries/useApplicationSettingsQuery';
import { useCurrentInstanceQuery } from 'src/hooks/queries/useCurrentInstanceQuery';
import { useFormDataForOptionsQuery } from 'src/hooks/queries/useFormdataForOptionsQuery';
import { useGetOptionsQuery } from 'src/hooks/queries/useGetOptionsQuery';
import { useLayoutSetsQuery } from 'src/hooks/queries/useLayoutSetsQuery';
import { useLayoutsQuery } from 'src/hooks/queries/useLayoutsQuery';
import { useRepeatingGroupsQuery } from 'src/hooks/queries/useRepeatingGroupsQuery';
import { useTextResourcesQuery } from 'src/hooks/queries/useTextResourcesQuery';
import { useLanguage } from 'src/hooks/useLanguage';
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
  const { selectedLanguage } = useLanguage();
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
  const { data: fetchedFormData } = useFormDataForOptionsQuery(
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

  const { label, description, helpText } = source || {};
  const { data: textResource } = useTextResourcesQuery(selectedLanguage, !!selectedLanguage);

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

    if (!source || !repeatingGroups) {
      return;
    }

    const findResourceById = (id?: string) => textResource?.resources?.find((resource) => resource.id === id);
    const relevantTextResources = {
      label: findResourceById(label),
      description: findResourceById(description),
      helpText: findResourceById(helpText),
    };

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
        relevantTextResources,
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
    fetchedOptions,
    formData,
    setOptions,
    label,
    description,
    helpText,
    textResource?.resources,
  ]);
  return options;
};
