import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { createStrictQueryContext } from 'src/core/contexts/queryContext';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { useCurrentLayoutSetId } from 'src/features/form/layout/useCurrentLayoutSetId';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

function useLayoutSettingsQuery() {
  const { fetchLayoutSettings } = useAppQueries();
  const layoutSetId = useCurrentLayoutSetId();
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['layoutSettings', layoutSetId],
    queryFn: () => fetchLayoutSettings(layoutSetId),
    onSuccess: (settings) => {
      dispatch(FormLayoutActions.fetchSettingsFulfilled({ settings }));
    },
    onError: (error: HttpClientError) => {
      window.logError('Fetching layout settings failed:\n', error);
    },
  });
}

const { Provider, useCtx } = createStrictQueryContext({
  name: 'LayoutSettings',
  useQuery: useLayoutSettingsQuery,
});

export const LayoutSettingsProvider = Provider;
export const useLayoutSettings = () => useCtx();
