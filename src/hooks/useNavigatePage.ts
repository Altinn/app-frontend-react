import { useCallback, useEffect, useMemo } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import { useIsStatelessApp } from 'src/features/applicationMetadata/appMetadataUtils';
import { usePageNavigationContext } from 'src/features/form/layout/PageNavigationContext';
import { useUiConfigContext } from 'src/features/form/layout/UiConfigContext';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { useLaxProcessData, useTaskType } from 'src/features/instance/ProcessContext';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { ProcessTaskType } from 'src/types';

type NavigateToPageOptions = {
  focusComponentId?: string;
  returnToView?: string;
};

export const useNavigationParams = () => {
  const instanceMatch = useMatch('/instance/:partyId/:instanceGuid');
  const taskIdMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId');
  const pageKeyMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId/:pageKey');

  const statelessMatch = useMatch('/:pageKey');

  const partyId = pageKeyMatch?.params.partyId ?? taskIdMatch?.params.partyId ?? instanceMatch?.params.partyId;
  const instanceGuid =
    pageKeyMatch?.params.instanceGuid ?? taskIdMatch?.params.instanceGuid ?? instanceMatch?.params.instanceGuid;
  const taskId = pageKeyMatch?.params.taskId ?? taskIdMatch?.params.taskId;
  const pageKey = pageKeyMatch?.params.pageKey ?? statelessMatch?.params.pageKey;

  return {
    partyId,
    instanceGuid,
    taskId,
    pageKey,
  };
};

export const useNavigatePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isStatelessApp = useIsStatelessApp();
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const lastTaskId = useLaxProcessData()?.processTasks?.slice(-1)[0]?.elementId;

  const { partyId, instanceGuid, taskId, pageKey } = useNavigationParams();
  const { orderWithHidden } = useUiConfigContext();
  const autoSaveBehavior = useAppSelector((state) => state.formLayout.uiConfig.autoSaveBehavior);

  const { setFocusId, setReturnToView, hidden } = usePageNavigationContext();
  const taskType = useTaskType(taskId);

  const hiddenPages = useMemo(() => new Set(hidden), [hidden]);
  const order = useMemo(
    () => orderWithHidden?.filter((page) => !hiddenPages.has(page)),
    [orderWithHidden, hiddenPages],
  );

  const currentPageId = pageKey ?? '';
  const currentPageIndex = order?.indexOf(currentPageId) ?? -1;
  const nextPageIndex = currentPageIndex !== -1 ? currentPageIndex + 1 : -1;
  const previousPageIndex = currentPageIndex !== -1 ? currentPageIndex - 1 : -1;

  /**
   * For stateless apps, this is how we redirect to the
   * initial page of the app.
   */
  useEffect(() => {
    if (isStatelessApp && order?.[0] !== undefined && !currentPageId) {
      navigate(`/${order?.[0]}`);
    }
  }, [isStatelessApp, order, navigate, currentPageId]);

  const navigateToPage = useCallback(
    (page?: string, options?: NavigateToPageOptions) => {
      if (!page) {
        return;
      }
      setFocusId(options?.focusComponentId);
      if (options?.returnToView) {
        setReturnToView(options.returnToView);
      }

      if (autoSaveBehavior === 'onChangePage' && order?.includes(currentPageId)) {
        dispatch(FormDataActions.saveLatest({}));
      }

      if (isStatelessApp) {
        return navigate(`/${page}`);
      }

      const url = `/instance/${partyId}/${instanceGuid}/${taskId}/${page}`;
      navigate(url);
    },
    [
      navigate,
      partyId,
      instanceGuid,
      taskId,
      setFocusId,
      setReturnToView,
      autoSaveBehavior,
      dispatch,
      order,
      currentPageId,
      isStatelessApp,
    ],
  );

  const isValidPageId = useCallback(
    (pageId: string) => {
      if (taskType === ProcessTaskType.Confirm && pageId === 'confirmation') {
        return true;
      }
      if (taskType === ProcessTaskType.Archived && pageId === 'receipt') {
        return true;
      }
      if (taskType === ProcessTaskType.Feedback && pageId === 'feedback') {
        return true;
      }
      return order?.includes(pageId) ?? false;
    },
    [order, taskType],
  );

  const navigateToTask = useCallback(
    (taskId?: string) => {
      const url = `/instance/${partyId}/${instanceGuid}/${taskId ?? lastTaskId}`;
      navigate(url);
    },
    [partyId, instanceGuid, lastTaskId, navigate],
  );

  const isCurrentTask = useMemo(() => currentTaskId === taskId, [currentTaskId, taskId]);

  const startUrl = useMemo(() => {
    if (taskType === ProcessTaskType.Confirm) {
      return `/instance/${partyId}/${instanceGuid}/${taskId}/confirmation`;
    }
    if (taskType === ProcessTaskType.Archived) {
      return `/instance/${partyId}/${instanceGuid}/ProccessEnd/receipt`;
    }
    if (taskType === ProcessTaskType.Feedback) {
      return `/instance/${partyId}/${instanceGuid}/ProccessEnd/feedback`;
    }
    return `/instance/${partyId}/${instanceGuid}/${taskId}/${order?.[0]}`;
  }, [partyId, instanceGuid, taskId, order, taskType]);

  const next = order?.[nextPageIndex];
  const previous = order?.[previousPageIndex];

  return {
    navigateToPage,
    navigateToTask,
    isCurrentTask,
    isValidPageId,
    startUrl,
    order,
    next,
    partyId,
    instanceGuid,
    currentPageId,
    taskId,
    previous,
  };
};
