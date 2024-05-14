import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { useSetCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useAllowAnonymousIs } from 'src/features/stateless/getAllowAnonymous';
import type { IProfile } from 'src/types/shared';

// Also used for prefetching @see globalPrefetcher.ts
export function useProfileQueryDef() {
  const { fetchUserProfile } = useAppQueries();
  return {
    queryKey: ['fetchUserProfile'],
    queryFn: fetchUserProfile,
  };
}

const useProfileQuery = () => {
  const enabled = useShouldFetchProfile();
  const { updateProfile } = useSetCurrentLanguage();

  const utils = useQuery({
    ...useProfileQueryDef(),
    enabled,
  });

  useEffect(() => {
    utils.error && window.logError('Fetching user profile failed:\n', utils.error);
  }, [utils.error]);

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
    query: useProfileQuery,
  }),
);

export const ProfileProvider = Provider;
export const useProfile = () => useCtx();
export const useShouldFetchProfile = () => useAllowAnonymousIs(false);
