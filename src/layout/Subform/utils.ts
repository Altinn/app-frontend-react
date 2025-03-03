import { useCallback, useEffect, useMemo } from 'react';

import dot from 'dot-object';

import { ContextNotProvided } from 'src/core/contexts/context';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useApplicationSettings } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useExternalApis } from 'src/features/externalApi/useExternalApi';
import { FD } from 'src/features/formData/FormDataWrite';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import {
  useLaxDataElementsSelectorProps,
  useLaxInstanceDataSources,
  useStrictInstanceId,
} from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useInnerLanguageWithForcedNodeSelector } from 'src/features/language/useLanguage';
import { useCodeListSelectorProps } from 'src/features/options/CodeListsProvider';
import { useCurrentPartyRoles } from 'src/features/useCurrentPartyRoles';
import { useMultipleDelayedSelectors } from 'src/hooks/delayedSelectors';
import { useShallowMemo } from 'src/hooks/useShallowMemo';
import { getStatefulDataModelUrl } from 'src/utils/urls/appUrlHelper';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { ExpressionDataSourcesWithoutNodes } from 'src/utils/layout/useExpressionDataSources';

export function useSubformFormData(dataElementId: string) {
  const instanceId = useStrictInstanceId();
  const url = getStatefulDataModelUrl(instanceId, dataElementId, true);
  const { isFetching: isSubformDataFetching, data: subformData, error: subformDataError } = useFormDataQuery(url);

  useEffect(() => {
    if (subformDataError) {
      window.logErrorOnce(`Error loading data element ${dataElementId} from server.\n`, subformDataError);
    }
  }, [dataElementId, subformDataError]);

  return { isSubformDataFetching, subformData, subformDataError };
}

export function useSubformDataSources(dataElementId: string, dataType: string) {
  const { isSubformDataFetching, subformData, subformDataError } = useSubformFormData(dataElementId);

  const _dataModelNames = DataModels.useReadableDataTypes();
  const dataModelNames = useMemo(
    () => (_dataModelNames.includes(dataType) ? _dataModelNames : [..._dataModelNames, dataType]),
    [_dataModelNames, dataType],
  );

  const [_formDataSelector, dataElementSelector, codeListSelector] = useMultipleDelayedSelectors(
    FD.useDebouncedSelectorProps(),
    useLaxDataElementsSelectorProps(),
    useCodeListSelectorProps(),
  );

  const formDataSelector = useCallback(
    (reference: IDataModelReference) => {
      if (reference.dataType !== dataType) {
        return _formDataSelector(reference);
      }
      return dot.pick(reference.field, subformData);
    },
    [_formDataSelector, dataType, subformData],
  );

  const process = useLaxProcessData();
  const applicationSettings = useApplicationSettings();
  const currentLanguage = useCurrentLanguage();

  const instanceDataSources = useLaxInstanceDataSources();
  const externalApis = useExternalApis(useApplicationMetadata().externalApiIds ?? []);
  const langToolsSelector = useInnerLanguageWithForcedNodeSelector(
    dataType,
    dataModelNames,
    formDataSelector,
    selectorContextNotProvided,
  );

  const roles = useCurrentPartyRoles();

  const subformDataSources: ExpressionDataSourcesWithoutNodes = useShallowMemo({
    roles,
    formDataSelector,
    process,
    applicationSettings,
    instanceDataSources,
    langToolsSelector,
    currentLanguage,
    defaultDataType: dataType,
    externalApis,
    dataModelNames,
    dataElementSelector,
    codeListSelector,
  });

  return { isSubformDataFetching, subformDataSources, subformData, subformDataError };
}

function selectorContextNotProvided(..._args: unknown[]): typeof ContextNotProvided {
  return ContextNotProvided;
}
