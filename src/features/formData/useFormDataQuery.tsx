import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { isAxiosError } from 'src/utils/isAxiosError';
import { maybeAuthenticationRedirect } from 'src/utils/maybeAuthenticationRedirect';
import { useIsStatelessApp } from 'src/utils/useIsStatelessApp';

export function useFormDataQuery(url: string | undefined) {
  const currentPartyId = useCurrentParty()?.partyId;
  const isStateless = useIsStatelessApp();

  // We also add the current task id to the query key, so that the query is re-fetched when the task changes. This
  // is needed because we provide this query two different places:
  // 1. In the <InitialFormDataProvider /> to fetch the initial form data for a task. At that point forwards, the
  //    form data is managed by the <FormDataWriteProvider />, which will maintain an updated copy of the form data.
  // 2. In the <FormDataReaders /> to fetch the form data used in text resource variable lookups on-demand. This
  //    reads the data model, assumes it doesn't really change, and caches it indefinitely. So, if you start at Task_1
  //    and then navigate to Task_2, the form data fetched during Task_1 may still be used in Task_2 unless evicted
  //    from the cache by using a different query key.
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;

  const options: AxiosRequestConfig = {};
  if (isStateless && currentPartyId !== undefined) {
    options.headers = {
      party: `partyid:${currentPartyId}`,
    };
  }

  // We dont want to refetch if only the language changes
  const urlPath = url ? new URL(url).pathname : undefined;
  const enabled = url !== undefined;
  const { fetchFormData } = useAppQueries();
  const utils = useQuery({
    // Form data is only fetched to initially populate the context, after that we keep the state internally
    // and push it back to the server.
    gcTime: 0,
    retry: false,

    queryKey: ['fetchFormData', urlPath, currentTaskId],
    queryFn: async () => await fetchFormData(url!, options),
    enabled,
  });

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

  return utils;
}
