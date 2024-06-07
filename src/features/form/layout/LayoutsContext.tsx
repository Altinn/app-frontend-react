import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { preProcessItem } from 'src/features/expressions/validation';
import { cleanLayout } from 'src/features/form/layout/cleanLayout';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useCurrentLayoutSetId } from 'src/features/form/layoutSets/useCurrentLayoutSetId';
import { useHasInstance } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useNavigationParams } from 'src/hooks/useNavigatePage';
import { useTaskStore } from 'src/layout/Summary2/taskIdStore';
import type { ExprObjConfig, ExprVal } from 'src/features/expressions/types';
import type { ILayoutCollection, ILayouts } from 'src/layout/layout';
import type { IExpandedWidthLayouts, IHiddenLayoutsExternal } from 'src/types';

export interface LayoutContextValue {
  layouts: ILayouts;
  hiddenLayoutsExpressions: IHiddenLayoutsExternal;
  expandedWidthLayouts: IExpandedWidthLayouts;
}

export function useLayoutQuery(layoutSetId?: string) {
  const { fetchLayouts } = useAppQueries();
  const hasInstance = useHasInstance();
  const process = useLaxProcessData();
  const currentLayoutSetId = useLayoutSetId();

  console.log('IN QUUEEERY', currentLayoutSetId);

  const utils = useQuery({
    // Waiting to fetch layouts until we have an instance, if we're supposed to have one
    // We don't want to fetch form layouts for a process step which we are currently not on
    enabled: hasInstance ? !!process : true,
    queryKey: ['formLayouts', currentLayoutSetId],
    queryFn: async () => processLayouts(await fetchLayouts(layoutSetId || currentLayoutSetId!)),
  });

  useEffect(() => {
    utils.error && window.logError('Fetching form layout failed:\n', utils.error);
  }, [utils.error]);

  return utils;
}
const { Provider, useCtx } = delayedContext(() =>
  createQueryContext({
    name: 'LayoutsContext',
    required: true,
    query: useLayoutQuery,
  }),
);

export function useLayoutSetId() {
  const layoutSets = useLayoutSets();
  const currentProcessLayoutSetId = useCurrentLayoutSetId();
  const { taskId } = useNavigationParams();

  const { overriddenLayoutSetId } = useTaskStore(({ overriddenLayoutSetId }) => ({ overriddenLayoutSetId }));

  if (overriddenLayoutSetId) {
    return overriddenLayoutSetId;
  }

  const layoutSetId = taskId != null ? layoutSets?.sets.find((set) => set.tasks?.includes(taskId))?.id : undefined;

  return layoutSetId ?? currentProcessLayoutSetId;
}
export const LayoutsProvider = Provider;
export const useLayouts = () => useCtx().layouts;
export const useGetLayout = (layoutId: string) => useCtx().layouts;

export const useHiddenLayoutsExpressions = () => useCtx().hiddenLayoutsExpressions;

export const useExpandedWidthLayouts = () => useCtx().expandedWidthLayouts;

function processLayouts(input: ILayoutCollection): LayoutContextValue {
  const layouts: ILayouts = {};
  const hiddenLayoutsExpressions: IHiddenLayoutsExternal = {};
  const expandedWidthLayouts: IExpandedWidthLayouts = {};
  for (const key of Object.keys(input)) {
    const file = input[key];
    layouts[key] = cleanLayout(file.data.layout);
    hiddenLayoutsExpressions[key] = file.data.hidden;
    expandedWidthLayouts[key] = file.data.expandedWidth;
  }

  const config: ExprObjConfig<{ hidden: ExprVal.Boolean; whatever: string }> = {
    hidden: {
      returnType: 'test',
      defaultValue: false,
      resolvePerRow: false,
    },
  };

  for (const key of Object.keys(hiddenLayoutsExpressions)) {
    hiddenLayoutsExpressions[key] = preProcessItem(hiddenLayoutsExpressions[key], config, ['hidden'], key);
  }

  for (const key of Object.keys(expandedWidthLayouts)) {
    expandedWidthLayouts[key] = preProcessItem(expandedWidthLayouts[key], config, ['hidden'], key);
  }

  return {
    layouts,
    hiddenLayoutsExpressions,
    expandedWidthLayouts,
  };
}
