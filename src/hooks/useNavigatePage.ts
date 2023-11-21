import { useCallback, useMemo } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import { useLayoutSettingsQ } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useLayoutSetsQuery } from 'src/hooks/queries/useLayoutSetsQuery';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { selectLayoutOrder } from 'src/selectors/getLayoutOrder';

export const useNavigatePage = () => {
  const navigate = useNavigate();
  const instanceMatch = useMatch('/instance/:partyId/:instanceGuid');
  const taskIdMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId');
  const pageKeyMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId/:pageKey');
  const pageOrder = useAppSelector(selectLayoutOrder);
  const layoutSets = useLayoutSetsQuery();
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;

  const partyId = pageKeyMatch?.params.partyId ?? taskIdMatch?.params.partyId ?? instanceMatch?.params.partyId;
  const instanceGuid =
    pageKeyMatch?.params.instanceGuid ?? taskIdMatch?.params.instanceGuid ?? instanceMatch?.params.instanceGuid;
  const taskId = pageKeyMatch?.params.taskId ?? taskIdMatch?.params.taskId;

  const layoutSettingsId =
    taskId != null ? layoutSets?.data?.sets.find((set) => set.tasks?.includes(taskId))?.id : undefined;
  const layoutSettings = useLayoutSettingsQ(layoutSettingsId);

  const pages = layoutSettings?.data?.pages.order;

  const currentPageId = pageKeyMatch?.params.pageKey ?? '';
  const currentPageIndex = pageOrder?.indexOf(currentPageId) ?? 0;

  const nextPageIndex = currentPageIndex !== -1 ? currentPageIndex + 1 : -1;
  const previousPageIndex = currentPageIndex !== -1 ? currentPageIndex - 1 : -1;

  const navigateToPage = useCallback(
    (page?: string) => {
      if (!page) {
        return;
      }
      const url = `/instance/${pageKeyMatch?.params.partyId}/${pageKeyMatch?.params.instanceGuid}/${pageKeyMatch?.params.taskId}/${page}`;
      navigate(url);
    },
    [navigate, pageKeyMatch],
  );

  const isValidPageId = useCallback((pageId: string) => pages?.includes(pageId) ?? false, [pages]);

  const navigateToTask = useCallback(
    (taskId: string) => {
      const partyId = pageKeyMatch?.params.partyId ?? taskIdMatch?.params.partyId ?? instanceMatch?.params.partyId;
      const instanceGuid =
        pageKeyMatch?.params.instanceGuid ?? taskIdMatch?.params.instanceGuid ?? instanceMatch?.params.instanceGuid;

      const url = `/instance/${partyId}/${instanceGuid}/${taskId}`;
      navigate(url);
    },
    [
      pageKeyMatch?.params.partyId,
      pageKeyMatch?.params.instanceGuid,
      taskIdMatch?.params.instanceGuid,
      taskIdMatch?.params.partyId,
      instanceMatch?.params.partyId,
      instanceMatch?.params.instanceGuid,
      navigate,
    ],
  );

  const isCurrentTask = useMemo(() => currentTaskId === taskId, [currentTaskId, taskId]);

  const startUrl = useMemo(
    () => `/instance/${partyId}/${instanceGuid}/${taskId}/${pageOrder?.[0]}`,
    [partyId, instanceGuid, taskId, pageOrder],
  );

  const next = pageOrder?.[nextPageIndex];
  const previous = pageOrder?.[previousPageIndex];

  return {
    navigateToPage,
    navigateToTask,
    isCurrentTask,
    isValidPageId,
    startUrl,
    next,
    currentPageId,
    taskId,
    previous,
  };
};
