import { useMemo } from 'react';

import { useLayoutCollection, useLayoutLookups } from 'src/features/form/layout/LayoutsContext';
import { useValidationOnNavigation } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import type { ILayoutFile, PageValidation } from 'src/layout/common.generated';

type PageValidationConfig = {
  getValidationOnNext: () => PageValidation | undefined;
  getValidationOnPrevious: () => PageValidation | undefined;
};

export function usePageValidationConfigForPage(pageKey: string | undefined): PageValidationConfig {
  const layoutCollection = useLayoutCollection();
  const layoutSettingsValidation = useValidationOnNavigation();

  return useMemo(() => {
    if (!pageKey) {
      return { getValidationOnNext: () => undefined, getValidationOnPrevious: () => undefined };
    }

    const currentPageLayout = layoutCollection[pageKey];
    const pageValidation = currentPageLayout?.data
      ?.validationOnNavigation as ILayoutFile['data']['validationOnNavigation'];

    const validationOnNavigation = pageValidation ?? layoutSettingsValidation;

    const getValidation = (direction: string) => {
      const prevent = validationOnNavigation?.preventNavigation;
      if (!prevent || prevent === 'all' || prevent === direction) {
        return validationOnNavigation;
      }
      return undefined;
    };

    return {
      getValidationOnNext: () => getValidation('forward'),
      getValidationOnPrevious: () => getValidation('previous'),
    };
  }, [pageKey, layoutCollection, layoutSettingsValidation]);
}

export function usePageValidationConfig(componentId: string): PageValidationConfig {
  const layoutLookups = useLayoutLookups();
  const pageKey = layoutLookups.componentToPage[componentId];
  return usePageValidationConfigForPage(pageKey);
}
