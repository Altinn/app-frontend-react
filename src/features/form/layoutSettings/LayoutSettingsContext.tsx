import React from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { useCurrentLayoutSetId } from 'src/features/form/layout/useCurrentLayoutSetId';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { Loader } from 'src/features/loading/Loader';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { createStrictContext } from 'src/utils/createContext';
import type { ILayoutSettings } from 'src/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const { Provider, useCtx } = createStrictContext<ILayoutSettings | undefined>({ name: 'LayoutSettingsContext' });

export function useLayoutSettingsQuery(layoutSetId?: string) {
  const { fetchLayoutSettings } = useAppQueries();
  const currentLayoutSetId = useCurrentLayoutSetId();
  const dispatch = useAppDispatch();

  const queryId = layoutSetId || currentLayoutSetId;

  return useQuery({
    queryKey: ['layoutSettings', queryId],
    queryFn: () => fetchLayoutSettings(queryId),
    onSuccess: (settings) => {
      dispatch(FormLayoutActions.fetchSettingsFulfilled({ settings }));
    },
    onError: (error: HttpClientError) => {
      dispatch(FormLayoutActions.fetchSettingsRejected({ error }));
      window.logError('Fetching layout settings failed:\n', error);
    },
  });
}

export function useLayoutSettingsQueryWithoutSideEffects(layoutSetId?: string) {
  const { fetchLayoutSettings } = useAppQueries();
  const currentLayoutSetId = useCurrentLayoutSetId();

  const queryId = layoutSetId || currentLayoutSetId;

  return useQuery({
    queryKey: ['layoutSettingsQueryWithoutSideEffects', queryId],
    queryFn: () => fetchLayoutSettings(queryId),
  });
}

export function LayoutSettingsProvider({ children }: React.PropsWithChildren) {
  const query = useLayoutSettingsQuery();

  if (query.error) {
    return <UnknownError />;
  }

  if (query.isLoading) {
    return <Loader reason='layout-settings' />;
  }

  return <Provider value={query.data}>{children}</Provider>;
}

export const useLayoutSettings = () => useCtx();
