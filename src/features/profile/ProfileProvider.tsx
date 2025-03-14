import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { useSetProfileForLanguage } from 'src/features/language/LanguageProvider';
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

const canHandleProfileQueryError = (error: UseQueryResult<IProfile | undefined>['error']) =>
  // The backend will return 400 if the logged in user/client is not a user.
  // Altinn users have profiles, but organisations, service owners and system users do not, so this is expected
  isAxiosError(error) && error.response?.status === 400;

const useProfileQuery = () => {
  const enabled = useShouldFetchProfile();
  const setProfileForLanguage = useSetProfileForLanguage();

  const utils = useQuery(useProfileQueryDef(enabled));

  useEffect(() => {
    if (utils.error) {
      if (canHandleProfileQueryError(utils.error)) {
        setProfileForLanguage(null);
        return;
      }

      window.logError('Fetching user profile failed:\n', utils.error);
    }
  }, [setProfileForLanguage, utils.error]);

  useEffect(() => {
    if (utils.data) {
      setProfileForLanguage(utils.data);
    }
  }, [setProfileForLanguage, utils.data]);

  useEffect(() => {
    if (!enabled) {
      setProfileForLanguage(null);
    }
  }, [setProfileForLanguage, enabled]);

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
    shouldDisplayError: (error) => !canHandleProfileQueryError(error),
    query: useProfileQuery,
  }),
);

export const ProfileProvider = Provider;
export const useProfile = () => useCtx();
export const useShouldFetchProfile = () => useAllowAnonymousIs(false);
