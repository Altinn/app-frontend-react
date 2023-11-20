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

const convertResult = (
  result: ITextResourceResult,
  dispatch: ReturnType<typeof useAppDispatch>,
): TextResourcesContext => {
  const { resources, language } = result;

  dispatch(TextResourcesActions.fetchFulfilled({ resources, language }));

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

  return {
    ...useQuery({
      enabled,
      queryKey: ['fetchTextResources', selectedLanguage],
      queryFn: async () => convertResult(await fetchTextResources(selectedLanguage), dispatch),
      onError: (error: AxiosError) => {
        window.logError('Fetching text resources failed:\n', error);
      },
    }),
    enabled,
  };
};

const { Provider, useCtx, useHasProvider } = delayedContext(() =>
  createQueryContext<TextResourcesContext | undefined, false>({
    name: 'TextResources',
    required: false,
    default: undefined,
    query: useTextResourcesQuery,
  }),
);

export const TextResourcesProvider = Provider;
export const useTextResources = () => useCtx()?.resources;
export const useTextResourcesLanguage = () => useCtx()?.language;
export const useHasTextResources = () => useHasProvider();
