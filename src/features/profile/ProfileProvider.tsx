import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { useSetCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useAllowAnonymousIs } from 'src/features/stateless/getAllowAnonymous';
import { isAxiosError } from 'src/utils/isAxiosError';
import type { IProfile } from 'src/types/shared';

// Also used for prefetching @see appPrefetcher.ts
export function useProfileQueryDef(enabled: boolean) {
  const { fetchUserProfile } = useAppQueries();
  return {
    queryKey: ['fetchUserProfile', enabled],
    queryFn: fetchUserProfile,
    enabled,
  };
}

const useProfileQuery = () => {
  const enabled = useShouldFetchProfile();
  const { updateProfile, noProfileFound } = useSetCurrentLanguage();

  const utils = useQuery(useProfileQueryDef(enabled));

  useEffect(() => {
    // Do not fail if 404, that probably means we're using an org token
    if (isAxiosError(utils.error) && utils.error.response?.status === 404) {
      noProfileFound();
      return;
    }

    utils.error && window.logError('Fetching user profile failed:\n', utils.error);
  }, [noProfileFound, utils.error]);

  useEffect(() => {
    if (utils.data) {
      updateProfile(utils.data);
    }
  }, [updateProfile, utils.data]);

  return {
    ...utils,
    enabled,
  };
};

const { Provider, useCtx } = delayedContext(() =>
  createQueryContext<IProfile | undefined, false>({
    name: 'Profile',
    required: false,
    default: undefined,
    shouldDisplayError: (error) => !isAxiosError(error) || error.response?.status !== 404,
    query: useProfileQuery,
  }),
);

export const ProfileProvider = Provider;
export const useProfile = () => useCtx();
export const useShouldFetchProfile = () => useAllowAnonymousIs(false);
