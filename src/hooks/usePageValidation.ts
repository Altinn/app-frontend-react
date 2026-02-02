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

    return {
      getValidationOnNext: () => validationOnNavigation,
      getValidationOnPrevious: () => validationOnNavigation,
    };
  }, [componentId, layoutLookups, layoutCollection]);
}
