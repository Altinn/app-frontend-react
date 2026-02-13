import { useMemo } from 'react';

import { useLayoutCollection, useLayoutLookups } from 'src/features/form/layout/LayoutsContext';
import { useValidationOnNavigation } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import type { ILayoutFile, PageValidation } from 'src/layout/common.generated';

export function useEffectivePageValidation(pageKey: string): {
  getPageValidation: () => PageValidation | undefined;
} {
  const layoutCollection = useLayoutCollection();
  const effectivePageValidation = useValidationOnNavigation();

  return useMemo(() => {
    if (!pageKey) {
      return { getPageValidation: () => undefined };
    }
    const currentPageLayout = layoutCollection[pageKey];
    const pageValidation = currentPageLayout?.data
      ?.validationOnNavigation as ILayoutFile['data']['validationOnNavigation'];

    const validationOnNavigation = pageValidation ?? effectivePageValidation;

    return {
      getPageValidation: () => validationOnNavigation,
    };
  }, [pageKey, layoutCollection, effectivePageValidation]);
}

export function usePageValidation(componentId: string) {
  const layoutLookups = useLayoutLookups();
  const pageKey = layoutLookups.componentToPage[componentId];

  return useEffectivePageValidation(pageKey ?? '');
}
