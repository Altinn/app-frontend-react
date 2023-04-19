import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { ProcessWrapper } from 'src/components/wrappers/ProcessWrapper';
import { Entrypoint } from 'src/features/entrypoint/Entrypoint';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useApplicationMetadataQuery } from 'src/hooks/queries/useApplicationMetadataQuery';
import { useApplicationSettingsQuery } from 'src/hooks/queries/useApplicationSettingsQuery';
import { useFooterLayoutQuery } from 'src/hooks/queries/useFooterLayoutQuery';
import { useCurrentPartyQuery } from 'src/hooks/queries/useGetCurrentPartyQuery';
import { useLayoutSetsQuery } from 'src/hooks/queries/useLayoutSetsQuery';
import { useOrgsQuery } from 'src/hooks/queries/useOrgsQuery';
import { useProfileQuery } from 'src/hooks/queries/useProfileQuery';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useKeepAlive } from 'src/hooks/useKeepAlive';
import { useUpdatePdfState } from 'src/hooks/useUpdatePdfState';
import { makeGetAllowAnonymousSelector } from 'src/selectors/getAllowAnonymous';
import { makeGetHasErrorsSelector } from 'src/selectors/getErrors';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IApplicationSettings } from 'src/types/shared';

export const App = () => {
  const { data: applicationSettings, isError: hasApplicationSettingsError } = useApplicationSettingsQuery();
  const { data: applicationMetadata, isError: hasApplicationMetadataError } = useApplicationMetadataQuery();
  const { data: layoutSets, isError: hasLayoutSetError } = useLayoutSetsQuery();
  const { data: orgs, isError: hasOrgsError } = useOrgsQuery();
  const { isError: hasFooterError } = useFooterLayoutQuery(!!applicationMetadata?.features?.footer);

  const { isError: hasProfileError } = useProfileQuery();
  const { isError: hasCurrentPartyError } = useCurrentPartyQuery();

  const componentIsReady = applicationSettings && applicationMetadata && layoutSets && orgs;
  const componentHasError =
    hasApplicationSettingsError ||
    hasApplicationMetadataError ||
    hasLayoutSetError ||
    hasOrgsError ||
    hasFooterError ||
    hasProfileError ||
    hasCurrentPartyError;

  const dispatch = useAppDispatch();
  const hasErrorSelector = makeGetHasErrorsSelector();
  const hasApiErrors: boolean = useAppSelector(hasErrorSelector);

  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);

  // Set the title of the app
  React.useEffect(() => {
    if (appName && appOwner) {
      document.title = `${appName} • ${appOwner}`;
    } else if (appName && !appOwner) {
      document.title = appName;
    } else if (!appName && appOwner) {
      document.title = appOwner;
    }
  }, [appOwner, appName]);

  React.useEffect(() => {
    dispatch(QueueActions.startInitialAppTaskQueue());
  }, [dispatch]);

  if (hasApiErrors || componentHasError) {
    return <UnknownError />;
  }

  if (componentIsReady) {
    return (
      <AppInternal
        applicationMetadata={applicationMetadata}
        applicationSettings={applicationSettings}
      />
    );
  }

  return null;
};

type AppInternalProps = {
  applicationSettings: IApplicationSettings;
  applicationMetadata: IApplicationMetadata;
};

const AppInternal = ({ applicationSettings, applicationMetadata }: AppInternalProps): JSX.Element | null => {
  const allowAnonymousSelector = makeGetAllowAnonymousSelector();
  const allowAnonymous: boolean = useAppSelector(allowAnonymousSelector);

  useKeepAlive(applicationSettings.appOidcProvider, allowAnonymous);
  useUpdatePdfState(allowAnonymous);

  // Ready to be rendered once allowAnonymous value has been determined
  const isPageReadyToRender = allowAnonymous !== undefined;
  if (!isPageReadyToRender) {
    return null;
  }
  return (
    <>
      <Routes>
        <Route
          path='/'
          element={
            <Entrypoint
              allowAnonymous={allowAnonymous}
              applicationMetadata={applicationMetadata}
            />
          }
        />
        <Route
          path='/partyselection/*'
          element={<PartySelection />}
        />
        <Route
          path='/instance/:partyId/:instanceGuid'
          element={<ProcessWrapper />}
        />
      </Routes>
    </>
  );
};
