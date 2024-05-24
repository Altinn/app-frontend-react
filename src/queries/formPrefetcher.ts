import { usePrefetchQuery } from 'src/core/queries/usePrefetchQuery';
import { useCustomValidationConfigQueryDef } from 'src/features/customValidation/useCustomValidationQuery';
import {
  useCurrentDataModelGuid,
  useCurrentDataModelName,
  useCurrentDataModelUrl,
} from 'src/features/datamodel/useBindingSchema';
import { useDataModelSchemaQueryDef } from 'src/features/datamodel/useDataModelSchemaQuery';
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
import { useOrderDetailsQueryDef } from 'src/features/payment/OrderDetailsProvider';
import { usePaymentInformationQueryDef } from 'src/features/payment/PaymentInformationProvider';
import { useHasPayment, useIsPayment } from 'src/features/payment/utils';
import { usePdfFormatQueryDef } from 'src/features/pdf/usePdfFormatQuery';
import { useBackendValidationQueryDef } from 'src/features/validation/backendValidation/backendValidationQuery';
import { useIsValidationEnabled, useShouldValidateDataType } from 'src/features/validation/utils';
import { useIsPdf } from 'src/hooks/useIsPdf';
import { getUrlWithLanguage } from 'src/utils/urls/urlHelper';

/**
 * Prefetches requests happening in the FormProvider
 */
export function FormPrefetcher() {
  const layoutSetId = useLayoutSetId();

  // Prefetch layouts
  usePrefetchQuery(useLayoutQueryDef(true, layoutSetId));

  // Prefetch default data model
  const url = getUrlWithLanguage(useCurrentDataModelUrl(true), useCurrentLanguage());
  const cacheKeyUrl = getFormDataCacheKeyUrl(url);
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const options = useFormDataQueryOptions();
  usePrefetchQuery(useFormDataQueryDef(cacheKeyUrl, currentTaskId, url, options));

  // Prefetch validations for default data model
  const currentLanguage = useCurrentLanguage();
  const instanceId = useLaxInstance()?.instanceId;
  const dataGuid = useCurrentDataModelGuid();
  const dataTypeId = useCurrentDataModelName();

  const shouldValidateDataType = useShouldValidateDataType()(dataTypeId);
  const isValidationEnabled = useIsValidationEnabled();
  usePrefetchQuery(
    useBackendValidationQueryDef(true, currentLanguage, instanceId, dataGuid, currentTaskId),
    isValidationEnabled && shouldValidateDataType,
  );

  // Prefetch customvalidation config and schema for default data model
  usePrefetchQuery(useCustomValidationConfigQueryDef(dataTypeId));
  usePrefetchQuery(useDataModelSchemaQueryDef(dataTypeId));

  // Prefetch other layout related files
  usePrefetchQuery(useLayoutSettingsQueryDef(layoutSetId));
  usePrefetchQuery(useDynamicsQueryDef(layoutSetId));
  usePrefetchQuery(useRulesQueryDef(layoutSetId));

  // Prefetch payment data if applicable
  usePrefetchQuery(usePaymentInformationQueryDef(useIsPayment(), instanceId));
  usePrefetchQuery(useOrderDetailsQueryDef(useHasPayment(), instanceId));

  // Prefetch PDF format only if we are in PDF mode
  const isPDF = useIsPdf();
  usePrefetchQuery(usePdfFormatQueryDef(true, instanceId, dataGuid), isPDF);

  return null;
}
