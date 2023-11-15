import { useEffect } from 'react';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { QueueActions } from 'src/features/queue/queueSlice';
import { TextResourcesActions } from 'src/features/textResources/textResourcesSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useLanguage } from 'src/hooks/useLanguage';
import type { ITextResourceResult } from 'src/features/textResources';

export const useGetTextResourcesQuery = (enabled: boolean): UseQueryResult<ITextResourceResult> => {
  const dispatch = useAppDispatch();
  const { fetchTextResources } = useAppQueries();
  const { selectedLanguage } = useLanguage();

  const queryResult = useQuery(['fetchTextResources', selectedLanguage], () => fetchTextResources(selectedLanguage), {
    enabled,
    onError: (error: AxiosError) => {
      dispatch(TextResourcesActions.fetchRejected({ error }));
      dispatch(QueueActions.appTaskQueueError({ error }));
      window.logError('Fetching text resources failed:\n', error);
    },
  });

  useEffect(() => {
    if (queryResult.data) {
      dispatch(TextResourcesActions.fetchFulfilled(queryResult.data));
    }
  }, [queryResult.data, dispatch]);

  return queryResult;
};
