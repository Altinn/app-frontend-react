import React from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { preProcessItem } from 'src/features/expressions/validation';
import { cleanLayout } from 'src/features/form/layout/fetch/fetchFormLayoutSagas';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { useCurrentLayoutSetId } from 'src/features/form/layout/useCurrentLayoutSetId';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { Loader } from 'src/features/isLoading/Loader';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { createStrictContext } from 'src/utils/createContext';
import type { ExprObjConfig, ExprVal } from 'src/features/expressions/types';
import type { ILayoutFileExternal } from 'src/layout/common.generated';
import type { ILayoutCollection, ILayouts } from 'src/layout/layout';
import type { IHiddenLayoutsExternal, INavigationConfig } from 'src/types';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const { Provider, useCtx } = createStrictContext<ILayoutCollection>();

function useLayoutQuery() {
  const { fetchLayouts } = useAppQueries();
  const layoutSetId = useCurrentLayoutSetId();
  const dispatch = useAppDispatch();
  const instance = useLaxInstanceData();
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata.applicationMetadata);

  return useQuery({
    queryKey: ['formLayouts', layoutSetId],
    queryFn: () =>
      // TODO: Pre-process the layouts to validate expressions
      fetchLayouts(layoutSetId),
    onSuccess: (data) => {
      if (!data || !applicationMetadata) {
        return;
      }
      const currentViewCacheKey = instance?.id || applicationMetadata.id;
      // const taskId = instance?.process?.currentTask?.elementId;
      legacyProcessLayouts({ input: data, dispatch, currentViewCacheKey });
    },
    onError: (error: HttpClientError) => {
      dispatch(FormLayoutActions.fetchRejected({ error }));
      dispatch(QueueActions.dataTaskQueueError({ error }));
      window.logError('Fetching form layout failed:\n', error);
    },
  });
}

export function FormLayoutProvider({ children }: React.PropsWithChildren) {
  const query = useLayoutQuery();
  const data = query.data;

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
}

function legacyProcessLayouts({ input, dispatch, currentViewCacheKey }: LegacyProcessProps) {
  const layouts: ILayouts = {};
  const navigationConfig: INavigationConfig = {};
  const hiddenLayoutsExpressions: IHiddenLayoutsExternal = {};
  if (isSingleLayout(input)) {
    layouts['FormLayout'] = cleanLayout(input.data.layout);
    hiddenLayoutsExpressions['FormLayout'] = input.data.hidden;
  } else {
    for (const key of Object.keys(input)) {
      const file = input[key];
      layouts[key] = cleanLayout(file.data.layout);
      hiddenLayoutsExpressions[key] = file.data.hidden;
      navigationConfig[key] = file.data.navigation;
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
      navigationConfig,
      hiddenLayoutsExpressions,
    }),
  );
  dispatch(
    FormLayoutActions.updateCurrentView({
      newView: firstLayoutKey,
      skipPageCaching: true,
    }),
  );
}

export const useLayoutCollection = () => useCtx();
