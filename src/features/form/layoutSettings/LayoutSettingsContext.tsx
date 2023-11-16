import React from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { createStrictContext } from 'src/core/contexts/context';
import { Loader } from 'src/core/loading/Loader';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { useCurrentLayoutSetId } from 'src/features/form/layout/useCurrentLayoutSetId';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { ILayoutSettings } from 'src/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const { Provider, useCtx } = createStrictContext<ILayoutSettings | undefined>({ name: 'LayoutSettingsContext' });

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

export function LayoutSettingsProvider({ children }: React.PropsWithChildren) {
  const query = useLayoutSettingsQuery();
  const data = query.data;

  if (query.error) {
    return <UnknownError />;
  }

  if (query.isLoading) {
    return <Loader reason='layout-settings' />;
  }

  return <Provider value={data}>{children}</Provider>;
}

export const useLayoutSettings = () => useCtx();
