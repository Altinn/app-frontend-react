import React from 'react';
import { useMatch } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { preProcessItem } from 'src/features/expressions/validation';
import { cleanLayout } from 'src/features/form/layout/cleanLayout';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { useCurrentLayoutSetId } from 'src/features/form/layout/useCurrentLayoutSetId';
import { useLayoutSettingsQueryWithoutSideEffects } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useHasInstance, useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { Loader } from 'src/features/loading/Loader';
import { useLayoutSetsQuery } from 'src/hooks/queries/useLayoutSetsQuery';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { createStrictContext } from 'src/utils/createContext';
import type { ExprObjConfig, ExprVal } from 'src/features/expressions/types';
import type { ILayoutFileExternal } from 'src/layout/common.generated';
import type { ILayoutCollection, ILayouts } from 'src/layout/layout';
import type { IHiddenLayoutsExternal } from 'src/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const { Provider, useCtx } = createStrictContext<ILayoutCollection>({ name: 'LayoutsContext' });

export function useLayoutQuery(layoutSetId?: string) {
  const { fetchLayouts } = useAppQueries();
  const hasInstance = useHasInstance();
  const process = useLaxProcessData();
  const currentLayoutSetId = useCurrentLayoutSetId();
  const dispatch = useAppDispatch();
  const instance = useLaxInstanceData();
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata.applicationMetadata);

  const _layoutSetId = layoutSetId ?? currentLayoutSetId;

  return useQuery({
    // Waiting to fetch layouts until we have an instance, if we're supposed to have one
    enabled: hasInstance ? !!process : true,
    queryKey: ['formLayouts', _layoutSetId],
    queryFn: () => fetchLayouts(_layoutSetId),
    onSuccess: (data) => {
      if (!data || !applicationMetadata) {
        return;
      }

      const currentViewCacheKey = instance?.id || applicationMetadata.id;
      legacyProcessLayouts({ input: data, dispatch, currentViewCacheKey, layoutSetId: _layoutSetId });
    },
    onError: (error: HttpClientError) => {
      dispatch(FormLayoutActions.fetchRejected({ error }));
      window.logError('Fetching form layout failed:\n', error);
    },
  });
}

export function useLayoutOrder(layoutSetId?: string) {
  const { data } = useLayoutQuery(layoutSetId);
  const layoutSettings = useLayoutSettingsQueryWithoutSideEffects(layoutSetId);

  if (!data) {
    return {};
  }

  const layouts: ILayouts = {};
  const hiddenLayoutsExpressions: IHiddenLayoutsExternal = {};
  if (isSingleLayout(data)) {
    layouts['FormLayout'] = cleanLayout(data.data.layout);
    hiddenLayoutsExpressions['FormLayout'] = data.data.hidden;
  } else {
    for (const key of Object.keys(data)) {
      const file = data[key];
      layouts[key] = cleanLayout(file.data.layout);
      hiddenLayoutsExpressions[key] = file.data.hidden;
    }
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

  const hiddenPages = new Set(Object.keys(data).filter((key) => data[key].data.hidden));
  return {
    hidden: hiddenPages,
    hiddenExpr: hiddenLayoutsExpressions,
    order: layoutSettings?.data?.pages?.order.filter((page) => !hiddenPages.has(page)),
  };
}

export function useLayoutSetId() {
  const layoutSets = useLayoutSetsQuery();
  const taskIdMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId');
  const pageKeyMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId/:pageKey');

  const taskId = pageKeyMatch?.params.taskId ?? taskIdMatch?.params.taskId;

  return taskId != null ? layoutSets?.data?.sets.find((set) => set.tasks?.includes(taskId))?.id : undefined;
}

export function LayoutsProvider({ children }: React.PropsWithChildren) {
  const query = useLayoutQuery();
  const data = query.data;

  if (query.error) {
    return <UnknownError />;
  }

  if (!data || query.isFetching) {
    return <Loader reason='form-layout' />;
  }

  if (isSingleLayout(data)) {
    return <Provider value={{ FormLayout: data }}>{children}</Provider>;
  }

  return <Provider value={data}>{children}</Provider>;
}

function isSingleLayout(layouts: ILayoutCollection | ILayoutFileExternal): layouts is ILayoutFileExternal {
  return 'data' in layouts && 'layout' in layouts.data && Array.isArray(layouts.data.layout);
}

interface LegacyProcessProps {
  input: ILayoutCollection | ILayoutFileExternal;
  dispatch: ReturnType<typeof useAppDispatch>;
  currentViewCacheKey: string;
  layoutSetId?: string;
}

function legacyProcessLayouts({ input, dispatch, currentViewCacheKey, layoutSetId }: LegacyProcessProps) {
  const layouts: ILayouts = {};
  const hiddenLayoutsExpressions: IHiddenLayoutsExternal = {};
  if (isSingleLayout(input)) {
    layouts['FormLayout'] = cleanLayout(input.data.layout);
    hiddenLayoutsExpressions['FormLayout'] = input.data.hidden;
  } else {
    for (const key of Object.keys(input)) {
      const file = input[key];
      layouts[key] = cleanLayout(file.data.layout);
      hiddenLayoutsExpressions[key] = file.data.hidden;
    }
  }

  const orderedLayoutKeys = Object.keys(layouts).sort();

  // use instance id (or application id for stateless) as cache key for current page
  dispatch(FormLayoutActions.setCurrentViewCacheKey({ key: currentViewCacheKey }));

  const lastVisitedPage = localStorage.getItem(currentViewCacheKey);
  const firstLayoutKey =
    lastVisitedPage && orderedLayoutKeys.includes(lastVisitedPage) ? lastVisitedPage : orderedLayoutKeys[0];

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

  dispatch(
    FormLayoutActions.fetchFulfilled({
      layouts,
      hiddenLayoutsExpressions,
      layoutSetId: layoutSetId || null,
    }),
  );
  dispatch(FormLayoutActions.initRepeatingGroups({}));
  dispatch(
    FormLayoutActions.updateCurrentView({
      newView: firstLayoutKey,
      skipPageCaching: true,
    }),
  );
}

export const useLayoutCollection = () => useCtx();
