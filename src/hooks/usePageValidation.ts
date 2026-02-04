import { useMemo } from 'react';

import { useLayoutCollection, useLayoutLookups } from 'src/features/form/layout/LayoutsContext';
import type { ILayoutFile, PageValidation } from 'src/layout/common.generated';

export function usePageValidationConfig(componentId: string): {
  getValidationOnNext: () => PageValidation | undefined;
  getValidationOnPrevious: () => PageValidation | undefined;
} {
  const layoutLookups = useLayoutLookups();
  const layoutCollection = useLayoutCollection();

  return useMemo(() => {
    const pageKey = layoutLookups.componentToPage[componentId];
    if (!pageKey) {
      return { getValidationOnNext: () => undefined, getValidationOnPrevious: () => undefined };
    }

    const currentPageLayout = pageKey ? layoutCollection[pageKey] : undefined;
    const validationOnNavigation = currentPageLayout?.data
      ?.validationOnNavigation as ILayoutFile['data']['validationOnNavigation'];

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
  }, [componentId, layoutLookups, layoutCollection]);
}
