import { useCallback } from 'react';

import { filterValidations, getVisibilityMask, selectValidations } from 'src/features/validation/utils';
import { Validation } from 'src/features/validation/validationContext';
import { useEffectEvent } from 'src/hooks/useEffectEvent';
import { useOrder } from 'src/hooks/useNavigatePage';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { PageValidation } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

/**
 * Checks if a page has validation errors as specified by the config.
 * If there are errors, the visibility of the page is set to the specified mask.
 *
 */
export function useOnPageNavigationValidation() {
  const setNodeVisibility = NodesInternal.useSetNodeVisibility();
  const getNodeValidations = NodesInternal.useValidationsSelector();
  const validating = Validation.useValidating();
  const pageOrder = useOrder();

  /* Ensures the callback will have the latest state */
  const callback = useEffectEvent((currentPage: LayoutPage, config: PageValidation): boolean => {
    const pageConfig = config.page ?? 'current';
    const masks = config.show;

    const mask = getVisibilityMask(masks);
    let nodes: LayoutNode[] = [];

    const currentIndex = pageOrder.indexOf(currentPage.pageKey);

    if (pageConfig === 'current') {
      // Get nodes for current page
      nodes = currentPage.flat();
    } else if (pageConfig === 'currentAndPrevious') {
      // Get nodes for current and previous pages
      if (!pageOrder || currentIndex === -1) {
        return false;
      }
      const pageKeysToCheck = pageOrder.slice(0, currentIndex + 1);
      const layoutPagesToCheck = pageKeysToCheck.map((key) => currentPage.layoutSet.all()[key]);
      nodes = layoutPagesToCheck.flatMap((page) => page.flat());
    } else {
      // Get all nodes
      nodes = currentPage.layoutSet.allNodes();
    }

    // Get nodes with errors along with their errors
    let onCurrentOrPreviousPage = false;
    const nodeErrors = nodes.map((n) => {
      const validations = getNodeValidations(n);
      const filtered = filterValidations(selectValidations(validations, mask, 'error'), n);
      onCurrentOrPreviousPage = onCurrentOrPreviousPage || pageOrder.indexOf(n.pageKey()) <= currentIndex;
      return [n, filtered.length > 0] as const;
    });

    if (nodeErrors.length > 0) {
      setNodeVisibility(
        nodeErrors.map(([n]) => n),
        mask,
      );

      // Only block navigation if there are errors on the current or previous pages
      return onCurrentOrPreviousPage;
    }

    return false;
  });

  return useCallback(
    async (currentPage: LayoutPage, config: PageValidation) => {
      await validating();
      return callback(currentPage, config);
    },
    [callback, validating],
  );
}
