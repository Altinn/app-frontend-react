import { useMemo } from 'react';

import { useLayoutCollection, useLayoutLookups } from 'src/features/form/layout/LayoutsContext';
import type { ILayoutFile, PageValidation } from 'src/layout/common.generated';

// src/features/validation/callbacks/usePageValidationConfig.ts
export function usePageValidationConfig(componentId: string): {
  getValidationForward: () => PageValidation | undefined;
  getValidationBackward: () => PageValidation | undefined;
} {
  const layoutLookups = useLayoutLookups();
  const layoutCollection = useLayoutCollection();

  return useMemo(() => {
    const pageKey = layoutLookups.componentToPage[componentId];
    if (!pageKey) {
      return { getValidationForward: () => undefined, getValidationBackward: () => undefined };
    }

    const currentPageLayout = pageKey ? layoutCollection[pageKey] : undefined;
    const validationOnNavigation = currentPageLayout?.data
      ?.validationOnNavigation as ILayoutFile['data']['validationOnNavigation'];

    return {
      getValidationForward: () => validationOnNavigation,
      getValidationBackward: () => validationOnNavigation,
    };
  }, [componentId, layoutLookups, layoutCollection]);
}
