import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { useAllowAnonymousIs } from 'src/features/applicationMetadata/getAllowAnonymous';
import { createStrictQueryContext } from 'src/features/contexts/queryContext';
import { useProfile } from 'src/features/profile/ProfileProvider';
import { TextResourcesActions } from 'src/features/textResources/textResourcesSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useLanguage } from 'src/hooks/useLanguage';
import type { ITextResourceResult } from 'src/features/textResources/index';

const useTextResourcesQuery = (): UseQueryResult<ITextResourceResult> => {
  const dispatch = useAppDispatch();
  const { fetchTextResources } = useAppQueries();
  const { selectedLanguage } = useLanguage();

  // This makes sure to await potential profile fetching before fetching text resources
  const profile = useProfile();
  const enabled = useAllowAnonymousIs(true) || profile !== undefined;

  return useQuery({
    enabled,
    queryKey: ['fetchTextResources', selectedLanguage],
    queryFn: () => fetchTextResources(selectedLanguage),
    onSuccess: (textResourceResult) => {
      dispatch(TextResourcesActions.fetchFulfilled(textResourceResult));
    },
    onError: (error: AxiosError) => {
      window.logError('Fetching text resources failed:\n', error);
    },
  });
};

const { Provider, useCtx } = createStrictQueryContext<ITextResourceResult>({
  name: 'TextResources',
  useQuery: useTextResourcesQuery,
});

export const TextResourcesProvider = Provider;
export const useTextResources = useCtx;
