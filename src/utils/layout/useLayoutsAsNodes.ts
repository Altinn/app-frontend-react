import { useMemo } from 'react';

import { useAppSelector } from 'src/common/hooks';
import { dataSourcesFromState, resolvedNodesInLayouts, rewriteTextResourceBindings } from 'src/utils/layout/hierarchy';
import type { LayoutRootNodeCollection } from 'src/utils/layout/hierarchy';

/**
 * React hook used for getting a memoized LayoutRootNodeCollection where you can look up components.
 *
 * Do not use this directly, rather useContext(ExprContext), which will fetch you an already resolved hierarchy.
 *
 * @see useResolvedNode
 */
export function useLayoutsAsNodes(): LayoutRootNodeCollection<'resolved'> {
  const dataSources = useAppSelector((state) => dataSourcesFromState(state));
  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const current = useAppSelector((state) => state.formLayout.uiConfig.currentView);
  const textResources = useAppSelector((state) => state.textResources.resources);

  return useMemo(() => {
    const resolved = resolvedNodesInLayouts(layouts, current, repeatingGroups, dataSources);
    rewriteTextResourceBindings(resolved, textResources);

    return resolved;
  }, [layouts, current, repeatingGroups, dataSources, textResources]);
}
