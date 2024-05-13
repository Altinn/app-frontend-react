import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import {
  useCurrentDataModelGuid,
  useCurrentDataModelName,
  useCurrentDataModelUrl,
} from 'src/features/datamodel/useBindingSchema';
import { useLayoutSetId } from 'src/features/form/layout/LayoutsContext';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { getUrlWithLanguage } from 'src/utils/urls/urlHelper';
import { useIsStatelessApp } from 'src/utils/useIsStatelessApp';

export function FormPrefetcher() {
  const queryClient = useQueryClient();
  const {
    fetchLayouts,
    fetchLayoutSettings,
    fetchDynamics,
    fetchRuleHandler,
    fetchCustomValidationConfig,
    fetchDataModelSchema,
    fetchPdfFormat,
    fetchFormData,
  } = useAppQueries();

  const layoutSetId = useLayoutSetId();
  const dataTypeId = useCurrentDataModelName();

  // Prefetch queries depending on layoutSetId
  useEffect(() => {
    if (layoutSetId) {
      queryClient.prefetchQuery({
        queryKey: ['formLayouts', layoutSetId],
        queryFn: () => fetchLayouts(layoutSetId),
      });

      queryClient.prefetchQuery({
        queryKey: ['layoutSettings', layoutSetId],
        queryFn: () => fetchLayoutSettings(layoutSetId),
      });

      queryClient.prefetchQuery({
        queryKey: ['fetchDynamics', layoutSetId],
        queryFn: () => fetchDynamics(layoutSetId),
      });

      queryClient.prefetchQuery({
        queryKey: ['fetchRules', layoutSetId],
        queryFn: () => fetchRuleHandler(layoutSetId),
      });
    }
  }, [layoutSetId, fetchLayouts, queryClient, fetchLayoutSettings, fetchDynamics, fetchRuleHandler]);

  // Prefetch queries depending on dataTypeId
  useEffect(() => {
    if (dataTypeId) {
      queryClient.prefetchQuery({
        queryKey: ['fetchCustomValidationConfig', dataTypeId],
        queryFn: () => fetchCustomValidationConfig(dataTypeId),
      });

      queryClient.prefetchQuery({
        queryKey: ['fetchDataModelSchemas', dataTypeId],
        queryFn: () => fetchDataModelSchema(dataTypeId),
      });
    }
  }, [
    layoutSetId,
    fetchLayouts,
    queryClient,
    fetchLayoutSettings,
    fetchDynamics,
    fetchRuleHandler,
    dataTypeId,
    fetchCustomValidationConfig,
    fetchDataModelSchema,
  ]);

  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const isStateless = useIsStatelessApp();
  const currentPartyId = useCurrentParty()?.partyId;
  const url = getUrlWithLanguage(useCurrentDataModelUrl(true), useCurrentLanguage());

  // Prefetch initial form data
  useEffect(() => {
    if (url) {
      const options: AxiosRequestConfig = {};
      if (isStateless && currentPartyId !== undefined) {
        options.headers = {
          party: `partyid:${currentPartyId}`,
        };
      }

      const urlPath = url ? new URL(url).pathname : undefined;

      queryClient.prefetchQuery({
        queryKey: ['fetchFormData', urlPath, currentTaskId],
        queryFn: () => fetchFormData(url, options),
      });
    }
  }, [currentPartyId, currentTaskId, fetchFormData, fetchPdfFormat, isStateless, queryClient, url]);

  const instanceId = useLaxInstance()?.instanceId;
  const dataGuid = useCurrentDataModelGuid();
  const [searchParams] = useSearchParams();
  const pdfActive = searchParams.get('pdf') === '1';

  // Prefetch PDF format if ?pdf=1
  useEffect(() => {
    if (pdfActive && instanceId && dataGuid) {
      queryClient.prefetchQuery({
        queryKey: ['fetchPdfFormat', instanceId, dataGuid],
        queryFn: () => fetchPdfFormat(instanceId, dataGuid),
      });
    }
  }, [dataGuid, fetchPdfFormat, instanceId, pdfActive, queryClient]);

  return null;
}
