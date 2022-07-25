/*
import { useCallback, useEffect } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { useAppDispatch } from 'src/common/hooks/useAppDispatch';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import type { IUpdateCurrentView } from 'src/features/form/layout/formLayoutTypes';

enum HistoryAction {
  BackOrForward = 'POP',
}

/!**
 * @param activePageId the formLayout page id that is currently active in the app
 * @return matchRootUrl: Matches the location pathname of the history root. If not, an empty string.
 *!/
export const useFormLayoutHistoryAndMatchInstanceLocation = ({
  activePageId,
}: {
  activePageId: string;
}): { matchRootUrl: string } => {
  const matchRoot = useRouteMatch<string>('/instance/:partyId/:instanceGuid');
  const matchRootUrl = matchRoot?.url || '';
  const dispatch = useAppDispatch();
  const doDispatch = useCallback(
    (payload: IUpdateCurrentView) => {
      dispatch(FormLayoutActions.updateCurrentView(payload));
    },
    [dispatch],
  );
  useFormLayoutHistory({
    renderedPageId: activePageId,
    renderFunc: doDispatch,
    pathToRoute: matchRootUrl,
  });
  return { matchRootUrl };
};

function useFormLayoutHistory({
  renderedPageId,
  renderFunc,
  pathToRoute,
}: {
  pathToRoute: string;
  renderedPageId: string;
  renderFunc: (IUpdateCurrentView) => void;
}) {
  const history = useHistory();
  useEffect(() => {
    return formLayoutHistory({
      history,
      renderedPageId,
      renderFunc,
      pathToRoute,
    });
  }, [history, renderedPageId, renderFunc, pathToRoute]);
}

function formLayoutHistory({
  history,
  renderedPageId,
  renderFunc,
  pathToRoute,
}: {
  history;
  pathToRoute: string;
  renderedPageId: string;
  renderFunc: (IUpdateCurrentView) => void;
}) {
  const pageIdFromLocation = getPageIdFromLocation(
    history.location,
    pathToRoute,
  );
  const browserIsOnRootPath = pageIdFromLocation === '';
  if (renderedPageId) {
    // When the application has rendered a view and the location path should reflect this.
    if (browserIsOnRootPath) {
      // The location path should be changed to the rendered page
      history.replace(`${pathToRoute}/${renderedPageId}`);
      return;
    }
    if (renderedPageId !== pageIdFromLocation) {
      // Put the rendered pageId in the path
      history.push(`${pathToRoute}/${renderedPageId}`);
    }
    return listenForHistoryAction(
      {
        action: HistoryAction.BackOrForward,
        history,
      },
      (location) => {
        const newView = getPageIdFromLocation(location, pathToRoute);
        if (newView && newView !== renderedPageId) {
          renderFunc({ newView });
        }
      },
    );
  }
  if (!browserIsOnRootPath) {
    // The application has not rendered a view and a request is sent for a specific page. I.e. direct link.
    renderFunc({ newView: pageIdFromLocation });
  }
}

function getPageIdFromLocation({ pathname }, removePath) {
  if (pathname === removePath) {
    return '';
  }
  return pathname.replace(`${removePath}/`, '');
}

function listenForHistoryAction({ history, action }, callBack) {
  return history.listen((location, historyAction) => {
    if (historyAction === action) {
      callBack(location, historyAction);
    }
  });
}
*/
