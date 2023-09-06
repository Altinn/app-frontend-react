import { useEffect } from 'react';

import { useApplicationMetadataQuery } from 'src/hooks/queries/useApplicationMetadataQuery';
import { useApplicationSettingsQuery } from 'src/hooks/queries/useApplicationSettingsQuery';
import { useCurrentInstanceQuery } from 'src/hooks/queries/useCurrentInstanceQuery';
import { useGetOptionsQuery } from 'src/hooks/queries/useGetOptionsQuery';
import { useLayoutSetsQuery } from 'src/hooks/queries/useLayoutSetsQuery';
import { useLayoutsQuery } from 'src/hooks/queries/useLayoutsQuery';
import { useTextResourcesQuery } from 'src/hooks/queries/useTextResourcesQuery';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { useStateDeepEqual } from 'src/hooks/useStateDeepEqual';
import { getLayoutSetIdForApplication } from 'src/utils/appMetadata';
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
  const { instanceId } = window;
  const [options, setOptions] = useStateDeepEqual<IOption[] | undefined>(undefined);
  const { selectedLanguage } = useLanguage();
  const formData = useAppSelector((state) => state.formData.formData);
  const repeatingGroups = useAppSelector((state) => state.formLayout?.uiConfig.repeatingGroups);

  const { data: instance } = useCurrentInstanceQuery(instanceId || '', !!instanceId);
  const { data: applicationMetadata } = useApplicationMetadataQuery();
  const { data: applicationSettings } = useApplicationSettingsQuery();
  const { data: layoutSets } = useLayoutSetsQuery();
  const { data: textResource } = useTextResourcesQuery(selectedLanguage, !!selectedLanguage);

  const layoutSetId = getLayoutSetIdForApplication(applicationMetadata || null, instance, layoutSets);
  const { data: layouts } = useLayoutsQuery(layoutSetId || '', !!layoutSetId);

  const { data: fetchedOptions } = useGetOptionsQuery(
    instanceId || '',
    optionsId || '',
    formData,
    mapping,
    queryParameters,
    secure,
    !!instanceId && !!optionsId && !!formData,
  );

  const { label, description, helpText } = source || {};

  useEffect(() => {
    if (fetchedOptions) {
      setOptions(fetchedOptions);
    }

    if (!!source && !!repeatingGroups) {
      // should be solved with useLanguage hook in setupSourceOptions
      const relevantFormData = (formData && getRelevantFormDataForOptionSource(formData, source)) || {};
      const findResourceById = (id?: string) => textResource?.resources?.find((resource) => resource.id === id);
      const relevantTextResources = {
        label: findResourceById(label),
        description: findResourceById(description),
        helpText: findResourceById(helpText),
      };

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
    }
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
    layouts,
  ]);
  return options;
};
