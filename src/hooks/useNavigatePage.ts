import { useCallback, useMemo } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import { useLayoutOrder } from 'src/features/form/layout/LayoutsContext';
import { useLaxProcessData, useTaskType } from 'src/features/instance/ProcessContext';
import { useLayoutSetsQuery } from 'src/hooks/queries/useLayoutSetsQuery';
import { ProcessTaskType } from 'src/types';

export const useNavigatePage = () => {
  const navigate = useNavigate();
  const instanceMatch = useMatch('/instance/:partyId/:instanceGuid');
  const taskIdMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId');
  const pageKeyMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId/:pageKey');

  const layoutSets = useLayoutSetsQuery();
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const lastTaskId = useLaxProcessData()?.processTasks?.slice(-1)[0]?.elementId;

  const partyId = pageKeyMatch?.params.partyId ?? taskIdMatch?.params.partyId ?? instanceMatch?.params.partyId;
  const instanceGuid =
    pageKeyMatch?.params.instanceGuid ?? taskIdMatch?.params.instanceGuid ?? instanceMatch?.params.instanceGuid;
  const taskId = pageKeyMatch?.params.taskId ?? taskIdMatch?.params.taskId;
  const taskType = useTaskType(taskId);

  const layoutSetId =
    taskId != null ? layoutSets?.data?.sets.find((set) => set.tasks?.includes(taskId))?.id : undefined;
  const { order } = useLayoutOrder(layoutSetId);

  const currentPageId = pageKeyMatch?.params.pageKey ?? '';
  const currentPageIndex = order?.indexOf(currentPageId) ?? 0;

  const nextPageIndex = currentPageIndex !== -1 ? currentPageIndex + 1 : -1;
  const previousPageIndex = currentPageIndex !== -1 ? currentPageIndex - 1 : -1;

  const navigateToPage = useCallback(
    (page?: string) => {
      if (!page) {
        return;
      }
      const url = `/instance/${partyId}/${instanceGuid}/${taskId}/${page}`;
      navigate(url);
    },
    [navigate, partyId, instanceGuid, taskId],
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
      const partyId = pageKeyMatch?.params.partyId ?? taskIdMatch?.params.partyId ?? instanceMatch?.params.partyId;
      const instanceGuid =
        pageKeyMatch?.params.instanceGuid ?? taskIdMatch?.params.instanceGuid ?? instanceMatch?.params.instanceGuid;

      const url = `/instance/${partyId}/${instanceGuid}/${taskId ?? lastTaskId}`;
      navigate(url);
    },
    [
      pageKeyMatch?.params.partyId,
      pageKeyMatch?.params.instanceGuid,
      taskIdMatch?.params.instanceGuid,
      taskIdMatch?.params.partyId,
      instanceMatch?.params.partyId,
      instanceMatch?.params.instanceGuid,
      lastTaskId,
      navigate,
    ],
  );

  const isCurrentTask = useMemo(() => currentTaskId === taskId, [currentTaskId, taskId]);

  const startUrl = useMemo(() => {
    if (taskType === ProcessTaskType.Confirm) {
      return `/instance/${partyId}/${instanceGuid}/${taskId}/confirmation`;
    }
    if (taskType === ProcessTaskType.Archived) {
      return `/instance/${partyId}/${instanceGuid}/${taskId}/receipt`;
    }
    if (taskType === ProcessTaskType.Feedback) {
      return `/instance/${partyId}/${instanceGuid}/${taskId}/feedback`;
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
    currentPageId,
    taskId,
    previous,
  };
};
