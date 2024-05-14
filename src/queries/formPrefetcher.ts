import { usePrefetchQuery } from 'src/core/queries/usePrefetchQuery';
import { useCustomValidationConfigQueryDef } from 'src/features/customValidation/CustomValidationContext';
import { useDataModelSchemaQueryDef } from 'src/features/datamodel/DataModelSchemaProvider';
import {
  useCurrentDataModelGuid,
  useCurrentDataModelName,
  useCurrentDataModelUrl,
} from 'src/features/datamodel/useBindingSchema';
import { useDynamicsQueryDef } from 'src/features/form/dynamics/DynamicsContext';
import { useLayoutQueryDef, useLayoutSetId } from 'src/features/form/layout/LayoutsContext';
import { useLayoutSettingsQueryDef } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useRulesQueryDef } from 'src/features/form/rules/RulesContext';
import {
  getFormDataCacheKeyUrl,
  useFormDataQueryDef,
  useFormDataQueryOptions,
} from 'src/features/formData/useFormDataQuery';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { usePdfFormatQueryDef } from 'src/features/pdf/usePdfFormatQuery';
import { useIsPdf } from 'src/hooks/useIsPdf';
import { getUrlWithLanguage } from 'src/utils/urls/urlHelper';

/**
 * Prefetches requests happening in the FormProvider
 */
export function FormPrefetcher() {
  const layoutSetId = useLayoutSetId();
  usePrefetchQuery(useLayoutQueryDef(layoutSetId));
  usePrefetchQuery(useLayoutSettingsQueryDef(layoutSetId));
  usePrefetchQuery(useDynamicsQueryDef(layoutSetId));
  usePrefetchQuery(useRulesQueryDef(layoutSetId));

  const dataTypeId = useCurrentDataModelName();
  usePrefetchQuery(useCustomValidationConfigQueryDef(dataTypeId));
  usePrefetchQuery(useDataModelSchemaQueryDef(dataTypeId));

  const url = getUrlWithLanguage(useCurrentDataModelUrl(true), useCurrentLanguage());
  const cacheKeyUrl = getFormDataCacheKeyUrl(url);
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const options = useFormDataQueryOptions();
  usePrefetchQuery(useFormDataQueryDef(cacheKeyUrl, currentTaskId, url, options));

  // Prefetch PDF format only if we are in PDF mode
  const instanceId = useLaxInstance()?.instanceId;
  const dataGuid = useCurrentDataModelGuid();
  const pdfActive = useIsPdf();
  usePrefetchQuery(usePdfFormatQueryDef(instanceId, dataGuid), pdfActive);

  return null;
}
