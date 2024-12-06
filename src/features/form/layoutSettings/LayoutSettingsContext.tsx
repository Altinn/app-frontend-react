import { useEffect } from 'react';

import { skipToken, useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { ContextNotProvided } from 'src/core/contexts/context';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { useLayoutSetId } from 'src/features/form/layout/LayoutsContext';
import { useLaxLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useShallowObjectMemo } from 'src/hooks/useShallowObjectMemo';
import type { QueryDefinition } from 'src/core/queries/usePrefetchQuery';
import type { GlobalPageSettings, ILayoutSets, ILayoutSettings } from 'src/layout/common.generated';

// Also used for prefetching @see formPrefetcher.ts
export function useLayoutSettingsQueryDef(layoutSetId?: string): QueryDefinition<ILayoutSettings> {
  const { fetchLayoutSettings } = useAppQueries();
  return {
    queryKey: ['layoutSettings', layoutSetId],
    queryFn: layoutSetId ? () => fetchLayoutSettings(layoutSetId) : skipToken,
    enabled: !!layoutSetId,
  };
}

function useLayoutSettingsQuery() {
  const layoutSetId = useLayoutSetId();

  if (!layoutSetId) {
    throw new Error('No layoutSet id found');
  }

  const utils = useQuery(useLayoutSettingsQueryDef(layoutSetId));

  useEffect(() => {
    utils.error && window.logError('Fetching layout settings failed:\n', utils.error);
  }, [utils.error]);

  return utils;
}

const { Provider, useCtx, useLaxCtx } = delayedContext(() =>
  createQueryContext<ILayoutSettings, true, ProcessedLayoutSettings>({
    name: 'LayoutSettings',
    required: true,
    query: useLayoutSettingsQuery,
    process: (settings) => {
      if (!('order' in settings.pages) && !('groups' in settings.pages)) {
        window.logError('Missing page order, specify one of `pages.order` or `pages.groups` in Settings.json');
        throw 'Missing page order, specify one of `pages.order` or `pages.groups` in Settings.json';
      }
      if ('order' in settings.pages && 'groups' in settings.pages) {
        window.logError('Both `pages.order` and `pages.groups` was set in Settings.json');
        throw 'Both `pages.order` and `pages.groups` was set in Settings.json';
      }

      const order: string[] =
        'order' in settings.pages ? settings.pages.order : settings.pages.groups.flatMap((group) => group.order);

      return {
        order,
        groups: 'groups' in settings.pages ? settings.pages.groups : undefined,
        pageSettings: {
          autoSaveBehavior: settings.pages.autoSaveBehavior,
          expandedWidth: settings.pages.expandedWidth,
          hideCloseButton: settings.pages.hideCloseButton,
          showExpandWidthButton: settings.pages.showExpandWidthButton,
          showLanguageSelector: settings.pages.showLanguageSelector,
          showProgress: settings.pages.showProgress,
        },
        pdfLayoutName: settings.pages.pdfLayoutName,
      };
    },
  }),
);

interface ProcessedLayoutSettings {
  order: string[];
  groups?: { name: string; order: string[] }[];
  pageSettings: GlobalPageSettings;
  pdfLayoutName?: string;
}

export const LayoutSettingsProvider = Provider;

/**
 * Returns the raw page order including hidden pages.
 * Returns an empty array if the context is not provided.
 */
export const useRawPageOrder = (): string[] => {
  const settings = useLaxCtx();
  return settings === ContextNotProvided ? emptyArray : settings.order;
};

export const usePdfLayoutName = () => useCtx().pdfLayoutName;
export const usePageGroups = () => {
  const settings = useLaxCtx();
  if (settings === ContextNotProvided) {
    return undefined;
  }
  return settings.groups;
};

const emptyArray = [];

const defaults: Required<GlobalPageSettings> = {
  hideCloseButton: false,
  showLanguageSelector: false,
  showProgress: false,
  showExpandWidthButton: false,
  autoSaveBehavior: 'onChangeFormData',
  expandedWidth: false,
};

export const usePageSettings = (): Required<GlobalPageSettings> => {
  const globalPagesSettings = useLaxLayoutSets();
  const layoutSettings = useLaxCtx();

  return useShallowObjectMemo({
    ...defaults,
    ...(globalPagesSettings === ContextNotProvided ? {} : (globalPagesSettings as ILayoutSets).uiSettings),
    ...(layoutSettings === ContextNotProvided ? {} : layoutSettings.pageSettings),
  });
};
