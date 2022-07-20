import { useEffect, useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import type { IUpdateCurrentView } from 'src/features/form/layout/formLayoutTypes';

/**
 * @param activePageId the formLayout page id that is currently active in the app
 * @return matchRootUrl: Matches the location pathname of the history root. If not, an empty string.
 */
export const useFormLayoutHistoryAndMatchInstanceLocation = ({
  activePageId,
}: {
  activePageId: string;
}): { matchRootUrl: string } => {
  const matchRoot = useRouteMatch<string>('/instance/:partyId/:instanceGuid');
  const matchRootUrl = matchRoot?.url || '';
  const history = useHistory();
  const dispatch = useAppDispatch();
  const dispatchAction = FormLayoutActions.updateCurrentView;
  const doDispatch = useCallback(
    (payload: IUpdateCurrentView) => {
      dispatch(dispatchAction(payload));
    },
    [dispatch, dispatchAction],
  );
  useEffect(() => {
    const pageIdFromLocation = history.location.pathname.replace(
      `${matchRootUrl}/`,
      '',
    );
    const locationIsRoot =
      !pageIdFromLocation || pageIdFromLocation === matchRootUrl;
    if (activePageId) {
      if (locationIsRoot) {
        history.replace(`${matchRootUrl}/${activePageId}`);
        return;
      } else if (activePageId !== pageIdFromLocation) {
        history.push(`${matchRootUrl}/${activePageId}`);
      }
      return history.listen((_location, action) => {
        const isBrowserBackOrForwardPressed = action === 'POP';
        if (isBrowserBackOrForwardPressed) {
          // newView will not be the same as pageIdFromLocation as this happens in the listener
          const newView = history.location.pathname.replace(
            `${matchRootUrl}/`,
            '',
          );
          if (newView && newView !== activePageId) {
            doDispatch({ newView });
          }
        }
      });
    } else if (!locationIsRoot) {
      doDispatch({ newView: pageIdFromLocation });
    }
  }, [activePageId, doDispatch, history, matchRootUrl]);

  return { matchRootUrl };
};
