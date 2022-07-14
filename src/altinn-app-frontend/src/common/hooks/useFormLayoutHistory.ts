import { useEffect } from 'react';
import { useAppDispatch } from 'src/common/hooks/index';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';

interface hookArgs {
  activePageId: string;
}

/**
 *
 * @param activePageId the expected formLayout page id
 *
 * @return matchUrl: Matches the location if there is an instance. If not, an empty string.
 *
 */
export const useFormLayoutHistoryAndMatchInstanceLocation = ({
  activePageId,
}: hookArgs) => {
  const dispatch = useAppDispatch();
  const match = useRouteMatch<string>('/instance/:partyId/:instanceGuid');
  const matchUrl = match?.url || '';
  const history = useHistory();

  useEffect(() => {
    if (activePageId) {
      const getPageIdFromLocation = () =>
        history.location?.pathname.replace(`${matchUrl}/`, '');
      const pageIdFromLocation = getPageIdFromLocation();
      const isOnRootPage =
        !pageIdFromLocation || pageIdFromLocation === matchUrl;

      if (isOnRootPage) {
        history.replace(`${matchUrl}/${activePageId}`);
      } else if (activePageId !== pageIdFromLocation) {
        history.push(`${matchUrl}/${activePageId}`);
      }

      return history.listen((_location, action) => {
        const isBrowserBackOrForwardPressed = action === 'POP';
        if (isBrowserBackOrForwardPressed) {
          const newView = getPageIdFromLocation();
          if (newView && newView !== activePageId) {
            dispatch(FormLayoutActions.updateCurrentView({ newView: newView }));
          }
        }
      });
    }
  }, [dispatch, activePageId, matchUrl, history]);

  return { matchUrl };
};
