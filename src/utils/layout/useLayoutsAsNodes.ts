import { useMemo } from 'react';

import { useAppSelector } from 'src/common/hooks';
import { nodesInLayouts, resolvedNodesInLayouts } from 'src/utils/layout/hierarchy';
import type { ContextDataSources } from 'src/features/expressions/ExprContext';
import type { LayoutRootNodeCollection } from 'src/utils/layout/hierarchy';

/**
 * React hook used for getting a memoized LayoutRootNodeCollection where you can look up components.
 *
 * Do not use this directly, rather useContext(ExprContext), which will fetch you an already resolved hierarchy.
 *
 * @see useResolvedNode
 */
export function useLayoutsAsNodes(dataSources?: undefined): LayoutRootNodeCollection;
export function useLayoutsAsNodes(dataSources?: ContextDataSources): LayoutRootNodeCollection<'resolved'>;
export function useLayoutsAsNodes(dataSources?: ContextDataSources | undefined): LayoutRootNodeCollection<any> {
  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const current = useAppSelector((state) => state.formLayout.uiConfig.currentView);

  return useMemo(() => {
    return dataSources
      ? resolvedNodesInLayouts(layouts, current, repeatingGroups, dataSources)
      : nodesInLayouts(layouts, current, repeatingGroups);
  }, [layouts, current, repeatingGroups, dataSources]);
}
