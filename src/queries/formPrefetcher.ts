import { usePrefetchQuery } from 'src/core/queries/usePrefetchQuery';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useCustomValidationConfigQueryDef } from 'src/features/customValidation/useCustomValidationQuery';
import {
  useCurrentDataModelGuid,
  useCurrentDataModelName,
  useCurrentDataModelUrl,
} from 'src/features/datamodel/useBindingSchema';
import { useDataModelSchemaQueryDef } from 'src/features/datamodel/useDataModelSchemaQuery';
import { isDataTypeWritable } from 'src/features/datamodel/utils';
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
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useOrderDetailsQueryDef } from 'src/features/payment/OrderDetailsProvider';
import { usePaymentInformationQueryDef } from 'src/features/payment/PaymentInformationProvider';
import { useHasPayment, useIsPayment } from 'src/features/payment/utils';
import { usePdfFormatQueryDef } from 'src/features/pdf/usePdfFormatQuery';
import { useBackendValidationQueryDef } from 'src/features/validation/backendValidation/backendValidationQuery';
import { useIsPdf } from 'src/hooks/useIsPdf';
import { TaskKeys } from 'src/hooks/useNavigatePage';
import { getUrlWithLanguage } from 'src/utils/urls/urlHelper';

/**
 * Prefetches requests happening in the FormProvider
 */
export function FormPrefetcher() {
  const layoutSetId = useLayoutSetId();
  const isPDF = useIsPdf();
  const dataTypeId = useCurrentDataModelName() ?? 'unknown';
  const currentProcessTaskId = useLaxProcessData()?.currentTask?.elementId;
  const isStateless = useApplicationMetadata().isStatelessApp;
  const instance = useLaxInstance();

  // Prefetch layouts
  usePrefetchQuery(useLayoutQueryDef(true, dataTypeId, layoutSetId));

  // Prefetch default data model
  const url = getUrlWithLanguage(useCurrentDataModelUrl(true), useCurrentLanguage());
  const cacheKeyUrl = getFormDataCacheKeyUrl(url);
  const options = useFormDataQueryOptions();
  usePrefetchQuery(useFormDataQueryDef(cacheKeyUrl, currentProcessTaskId, url, options));

  // Prefetch validations for default data model, as long as its writable
  const currentLanguage = useCurrentLanguage();
  const dataGuid = useCurrentDataModelGuid();
  const isCustomReceipt = useProcessTaskId() === TaskKeys.CustomReceipt;

  // No need to load validations in PDF mode
  usePrefetchQuery(
    useBackendValidationQueryDef(true, currentLanguage, instance?.instanceId, currentProcessTaskId),
    !isCustomReceipt && !isPDF && !isStateless,
  );

  const isWritable = isDataTypeWritable(dataTypeId, isStateless, instance?.data);

  // Prefetch customvalidation config and schema for default data model, unless in PDF
  usePrefetchQuery(useCustomValidationConfigQueryDef(!isPDF && isWritable, dataTypeId));
  usePrefetchQuery(useDataModelSchemaQueryDef(!isPDF, dataTypeId));

  // Prefetch other layout related files
  usePrefetchQuery(useLayoutSettingsQueryDef(layoutSetId));
  usePrefetchQuery(useDynamicsQueryDef(layoutSetId));
  usePrefetchQuery(useRulesQueryDef(layoutSetId));

  // Prefetch payment data if applicable
  usePrefetchQuery(usePaymentInformationQueryDef(useIsPayment(), instance?.instanceId));
  usePrefetchQuery(useOrderDetailsQueryDef(useHasPayment(), instance?.instanceId));

  // Prefetch PDF format only if we are in PDF mode
  usePrefetchQuery(usePdfFormatQueryDef(true, instance?.instanceId, dataGuid), isPDF);

  return null;
}
