import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { ApplicationSettingsActions } from 'src/features/applicationSettings/applicationSettingsSlice';
import { createStrictQueryContext } from 'src/features/contexts/queryContext';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IApplicationSettings } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useApplicationSettingsQuery = () => {
  const dispatch = useAppDispatch();
  const { fetchApplicationSettings } = useAppQueries();
  return useQuery({
    queryKey: ['fetchApplicationSettings'],
    queryFn: fetchApplicationSettings,
    onSuccess: (settings) => {
      // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
      dispatch(ApplicationSettingsActions.fetchApplicationSettingsFulfilled({ settings }));
    },
    onError: (error: HttpClientError) => {
      if (error.status === 404) {
        dispatch(ApplicationSettingsActions.fetchApplicationSettingsRejected({ error: null }));
        window.logWarn('Application settings not found:\n', error);
      } else {
        // Update the Redux Store ensures that legacy code has access to the data without using the Tanstack Query Cache
        dispatch(ApplicationSettingsActions.fetchApplicationSettingsRejected({ error }));
        window.logError('Fetching application settings failed:\n', error);
      }
    },
  });
};

const { Provider, useCtx } = createStrictQueryContext<IApplicationSettings>({
  name: 'ApplicationSettings',
  useQuery: useApplicationSettingsQuery,
});

export const ApplicationSettingsProvider = Provider;
export const useApplicationSettings = useCtx;
