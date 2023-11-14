import { useCallback } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { selectLayoutOrder } from 'src/selectors/getLayoutOrder';

export const useNavigatePage = () => {
  const navigate = useNavigate();
  const instanceMatch = useMatch('/instance/:partyId/:instanceGuid');
  const pageKeyMatch = useMatch('/instance/:partyId/:instanceGuid/:pageKey');
  const pageOrder = useAppSelector(selectLayoutOrder);

  const currentPageId = pageKeyMatch?.params.pageKey ?? '';
  const currentPageIndex = pageOrder?.indexOf(currentPageId) ?? 0;

  const nextPageIndex = currentPageIndex !== -1 ? currentPageIndex + 1 : -1;
  const previousPageIndex = currentPageIndex !== -1 ? currentPageIndex - 1 : -1;

  const next = pageOrder?.[nextPageIndex];
  const previous = pageOrder?.[previousPageIndex];

  const navigateToPage = useCallback(
    (page?: string) => {
      if (!page) {
        return;
      }
      navigate(`/instance/${pageKeyMatch?.params.partyId}/${pageKeyMatch?.params.instanceGuid}/${page}`);
    },
    [navigate, pageKeyMatch],
  );

  const navigateToStart = useCallback(() => {
    const firstPage = pageOrder?.[0];
    const partyId = pageKeyMatch?.params.partyId ?? instanceMatch?.params.partyId;
    const instanceGuid = pageKeyMatch?.params.instanceGuid ?? instanceMatch?.params.instanceGuid;

    navigate(`/instance/${partyId}/${instanceGuid}/${firstPage}`);
  }, [navigate, instanceMatch, pageKeyMatch, pageOrder]);

  const isValidPageId = useCallback((pageId: string) => pageOrder?.includes(pageId) ?? false, [pageOrder]);

  return {
    navigateToPage,
    navigateToStart,
    currentPageId,
    isValidPageId,
    next,
    previous,
  };
};
