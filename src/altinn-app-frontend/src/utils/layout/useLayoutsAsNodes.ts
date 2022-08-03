import { useMemo } from 'react';

import { useAppSelector } from 'src/common/hooks';
import {
  LayoutRootNodeCollection,
  nodesInLayout,
} from 'src/utils/layout/hierarchy';

/**
 * React hook used for getting a memoized LayoutRootNodeCollection where you can look up components
 */
export function useLayoutsAsNodes(): LayoutRootNodeCollection<any> {
  const repeatingGroups = useAppSelector(
    (state) => state.formLayout.uiConfig.repeatingGroups,
  );
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const current = useAppSelector(
    (state) => state.formLayout.uiConfig.currentView,
  );

  return useMemo(() => {
    const asNodes = {};
    for (const key of Object.keys(layouts)) {
      asNodes[key] = nodesInLayout(layouts[key], repeatingGroups);
    }

    return new LayoutRootNodeCollection(
      current as keyof typeof asNodes,
      asNodes,
    );
  }, [layouts, current, repeatingGroups]);
}
