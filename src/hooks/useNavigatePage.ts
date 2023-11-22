import { useCallback, useMemo } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import { useHiddenPages } from 'src/features/form/layout/LayoutsContext';
import { useLayoutSettingsQ } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useLayoutSetsQuery } from 'src/hooks/queries/useLayoutSetsQuery';

export const useNavigatePage = () => {
  const navigate = useNavigate();
  const instanceMatch = useMatch('/instance/:partyId/:instanceGuid');
  const taskIdMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId');
  const pageKeyMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId/:pageKey');

  const layoutSets = useLayoutSetsQuery();
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;

  const partyId = pageKeyMatch?.params.partyId ?? taskIdMatch?.params.partyId ?? instanceMatch?.params.partyId;
  const instanceGuid =
    pageKeyMatch?.params.instanceGuid ?? taskIdMatch?.params.instanceGuid ?? instanceMatch?.params.instanceGuid;
  const taskId = pageKeyMatch?.params.taskId ?? taskIdMatch?.params.taskId;

  const layoutSettingsId =
    taskId != null ? layoutSets?.data?.sets.find((set) => set.tasks?.includes(taskId))?.id : undefined;
  const layoutSettings = useLayoutSettingsQ(layoutSettingsId);
  const layouts = useHiddenPages();

  const pages = layoutSettings?.data?.pages?.order.filter((page) => !layouts?.hidden.has(page));

  const currentPageId = pageKeyMatch?.params.pageKey ?? '';
  const currentPageIndex = pages?.indexOf(currentPageId) ?? 0;

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
    () => `/instance/${partyId}/${instanceGuid}/${taskId}/${pages?.[0]}`,
    [partyId, instanceGuid, taskId, pages],
  );

  const next = pages?.[nextPageIndex];
  const previous = pages?.[previousPageIndex];

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
