import { useEffect, useRef } from 'react';

import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { type QueryDefinition } from 'src/core/queries/usePrefetchQuery';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useMemoDeepEqual } from 'src/hooks/useStateDeepEqual';
import { isAxiosError } from 'src/utils/isAxiosError';
import { maybeAuthenticationRedirect } from 'src/utils/maybeAuthenticationRedirect';

export function useFormDataQueryDef(
  cacheKeyUrl?: string,
  currentTaskId?: string,
  url?: string,
  options?: AxiosRequestConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): QueryDefinition<any> {
  const { fetchFormData } = useAppQueries();
  return {
    queryKey: ['fetchFormData', cacheKeyUrl, currentTaskId],
    queryFn: url ? () => fetchFormData(url, options) : skipToken,
    enabled: !!url,
    gcTime: 0,
    staleTime: 0,
    refetchInterval: false,
  };
}

export function useFormDataQueryOptions() {
  const currentPartyId = useCurrentParty()?.partyId;
  const isStateless = useApplicationMetadata().isStatelessApp;
  const options: AxiosRequestConfig = {};
  if (isStateless && currentPartyId !== undefined) {
    options.headers = {
      party: `partyid:${currentPartyId}`,
    };
  }
  return options;
}

// We dont want to include the current language in the cacheKey url, but for stateless we still need to keep
// the 'dataType' query parameter in the cacheKey url to avoid caching issues.
export function getFormDataCacheKeyUrl(url: string | undefined) {
  if (!url) {
    return undefined;
  }
  const urlObj = new URL(url);
  const searchParams = new URLSearchParams(urlObj.search);
  searchParams.delete('language');
  return `${urlObj.pathname}?${searchParams.toString()}`;
}

export function useFormDataQuery(url: string | undefined) {
  // We also add the current task id to the query key, so that the query is re-fetched when the task changes. This
  // is needed because we provide this query two different places:
  // 1. In the <DataModelsProvider /> to fetch the initial form data for a task. At that point forwards, the
  //    form data is managed by the <FormDataWriteProvider />, which will maintain an updated copy of the form data.
  // 2. In the <FormDataReaders /> to fetch the form data used in text resource variable lookups on-demand. This
  //    reads the data model, assumes it doesn't really change, and caches it indefinitely. So, if you start at Task_1
  //    and then navigate to Task_2, the form data fetched during Task_1 may still be used in Task_2 unless evicted
  //    from the cache by using a different query key.
  const options = useFormDataQueryOptions();
  const currentProcessTaskId = useLaxProcessData()?.currentTask?.elementId;
  const cacheKeyUrl = getFormDataCacheKeyUrl(url);

  const isInitialRender = useRef(true);
  const queryClient = useQueryClient();
  const def = useFormDataQueryDef(cacheKeyUrl, currentProcessTaskId, url, options);
  const queryKey = useMemoDeepEqual(() => def.queryKey, [def.queryKey]);
  const dataFromCache = queryClient.getQueryData(queryKey);

  let pretendThereIsNoData = false;
  if (isInitialRender.current && dataFromCache) {
    // If we have data in the cache during the initial render, our attempts to never cache the data have failed.
    // This actually happens during the first test in the navigation.ts cypress test suite. We'll remember this
    // and return empty data to avoid storing stale initial data.
    pretendThereIsNoData = true;
  }
  isInitialRender.current = false;

  const utils = useQuery(def);

  useEffect(() => {
    if (utils.error && isAxiosError(utils.error)) {
      if (utils.error.message?.includes('403')) {
        // This renders the <MissingRolesError /> component in the provider
        window.logInfo('Current party is missing roles');
      } else {
        window.logError('Fetching form data failed:\n', utils.error);
      }

      maybeAuthenticationRedirect(utils.error).then();
    }
  }, [utils.error]);

  if (pretendThereIsNoData) {
    // We'll pretend there is no data in the cache to avoid storing stale initial data
    return { ...utils, data: undefined };
  }

  return utils;
}
