import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { useAllowAnonymousIs } from 'src/features/applicationMetadata/getAllowAnonymous';
import { useProfile } from 'src/features/profile/ProfileProvider';
import { resourcesAsMap } from 'src/features/textResources/resourcesAsMap';
import { TextResourcesActions } from 'src/features/textResources/textResourcesSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useLanguage } from 'src/hooks/useLanguage';
import type { ITextResourceResult, TextResourceMap } from 'src/features/textResources/index';

export interface TextResourcesContext {
  resources: TextResourceMap;
  language: string;
}

const convertResult = (result: ITextResourceResult): TextResourcesContext => {
  const { resources, language } = result;

  return {
    resources: resourcesAsMap(resources),
    language,
  };
};

const useTextResourcesQuery = () => {
  const dispatch = useAppDispatch();
  const { fetchTextResources } = useAppQueries();
  const { selectedLanguage } = useLanguage();

  // This makes sure to await potential profile fetching before fetching text resources
  const profile = useProfile();
  const enabled = useAllowAnonymousIs(true) || profile !== undefined;

  const utils = {
    ...useQuery({
      enabled,
      queryKey: ['fetchTextResources', selectedLanguage],
      queryFn: () => fetchTextResources(selectedLanguage),
      onError: (error: AxiosError) => {
        window.logError('Fetching text resources failed:\n', error);
      },
    }),
    enabled,
  };

  useEffect(() => {
    if (utils.data) {
      dispatch(TextResourcesActions.fetchFulfilled({ resources: utils.data.resources, language: utils.data.language }));
    }
  }, [dispatch, utils.data]);

  return utils;
};

const { Provider, useCtx, useHasProvider } = delayedContext(() =>
  createQueryContext<ITextResourceResult, false, TextResourcesContext | undefined>({
    name: 'TextResources',
    required: false,
    default: undefined,
    query: useTextResourcesQuery,
    process: convertResult,
  }),
);

export const TextResourcesProvider = Provider;
export const useTextResources = () => useCtx()?.resources;
export const useTextResourcesLanguage = () => useCtx()?.language;
export const useHasTextResources = () => useHasProvider();
