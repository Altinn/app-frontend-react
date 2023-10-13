import React, { useRef } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AltinnContentIconFormData } from 'src/components/atoms/AltinnContentIconFormData';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import { ProcessWrapper } from 'src/components/wrappers/ProcessWrapper';
import { Entrypoint } from 'src/features/entrypoint/Entrypoint';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useApplicationMetadataQuery } from 'src/hooks/queries/useApplicationMetadataQuery';
import { useApplicationSettingsQuery } from 'src/hooks/queries/useApplicationSettingsQuery';
import { useCurrentDataModelSchemaQuery } from 'src/hooks/queries/useCurrentDataModelSchemaQuery';
import { useFooterLayoutQuery } from 'src/hooks/queries/useFooterLayoutQuery';
import { useFormDataQuery } from 'src/hooks/queries/useFormDataQuery';
import { useCurrentPartyQuery } from 'src/hooks/queries/useGetCurrentPartyQuery';
import { usePartiesQuery } from 'src/hooks/queries/useGetPartiesQuery';
import { useLayoutSetsQuery } from 'src/hooks/queries/useLayoutSetsQuery';
import { useOrgsQuery } from 'src/hooks/queries/useOrgsQuery';
import { useProfileQuery } from 'src/hooks/queries/useProfileQuery';
import { useAlwaysPromptForParty } from 'src/hooks/useAlwaysPromptForParty';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useKeepAlive } from 'src/hooks/useKeepAlive';
import { useLanguage } from 'src/hooks/useLanguage';
import { useUpdatePdfState } from 'src/hooks/useUpdatePdfState';
import { makeGetAllowAnonymousSelector } from 'src/selectors/getAllowAnonymous';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import { ProcessTaskType } from 'src/types';
import type { IApplicationSettings } from 'src/types/shared';

import '@digdir/design-system-tokens/brand/altinn/tokens.css';

export const App = () => {
  const { data: applicationSettings, isError: hasApplicationSettingsError } = useApplicationSettingsQuery();
  const { data: applicationMetadata, isError: hasApplicationMetadataError } = useApplicationMetadataQuery();
  const { isError: hasLayoutSetError } = useLayoutSetsQuery();
  const { isError: hasOrgsError } = useOrgsQuery();
  useFooterLayoutQuery(!!applicationMetadata?.features?.footer);
  useCurrentDataModelSchemaQuery();

  const componentIsReady = applicationSettings && applicationMetadata;
  const componentHasError =
    hasApplicationSettingsError || hasApplicationMetadataError || hasLayoutSetError || hasOrgsError;

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(QueueActions.startInitialAppTaskQueue());
  }, [dispatch]);

  if (componentHasError) {
    return <UnknownError />;
  }

  if (componentIsReady) {
    return <AppInternal applicationSettings={applicationSettings} />;
  }

  return null;
};

type AppInternalProps = {
  applicationSettings: IApplicationSettings;
};

const AppInternal = ({ applicationSettings }: AppInternalProps): JSX.Element | null => {
  const allowAnonymousSelector = makeGetAllowAnonymousSelector();
  const allowAnonymous = useAppSelector(allowAnonymousSelector);

  const { isError: hasProfileError, isFetching: isProfileFetching } = useProfileQuery(allowAnonymous === false);
  const { isError: hasPartiesError, isFetching: isPartiesFetching } = usePartiesQuery(allowAnonymous === false);

  const alwaysPromptForParty = useAlwaysPromptForParty();

  const { isError: hasCurrentPartyError } = useCurrentPartyQuery(
    alwaysPromptForParty === false && allowAnonymous === false,
  );

  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);

  useKeepAlive(applicationSettings.appOidcProvider, allowAnonymous);
  useUpdatePdfState(allowAnonymous);
  const { isFetching: isFormDataFetching } = useFormDataQuery();

  const hasComponentError = hasProfileError || hasCurrentPartyError || hasPartiesError;
  const isFetching = isProfileFetching || isPartiesFetching || isFormDataFetching;

  // Set the title of the app
  React.useEffect(() => {
    if (appName && appOwner) {
      document.title = `${appName} - ${appOwner}`;
    } else if (appName && !appOwner) {
      document.title = appName;
    } else if (!appName && appOwner) {
      document.title = appOwner;
    }
  }, [appOwner, appName]);

  const isReadyToRenderRoutes = allowAnonymous !== undefined;
  if (isReadyToRenderRoutes) {
    return (
      <>
        <Routes>
          <Route
            path='/'
            element={
              <PreventNavigatingBackWrapper path={'root'}>
                <Entrypoint allowAnonymous={allowAnonymous} />
              </PreventNavigatingBackWrapper>
            }
          />
          <Route
            path='/partyselection/*'
            element={
              <PreventNavigatingBackWrapper path={'partySelection'}>
                <PartySelection />
              </PreventNavigatingBackWrapper>
            }
          />
          <Route
            path='/instance/:partyId/:instanceGuid'
            element={
              <PreventNavigatingBackWrapper path={'instance'}>
                <ProcessWrapper isFetching={isFetching} />
              </PreventNavigatingBackWrapper>
            }
          />
        </Routes>
      </>
    );
  }

  if (hasComponentError) {
    return <UnknownError />;
  }

  return null;
};

function PreventNavigatingBackWrapper({
  children,
  path,
}: React.PropsWithChildren<{ path: 'root' | 'instance' | 'partySelection' }>) {
  const { langAsString } = useLanguage();
  const instanceData = useAppSelector((state) => state.instanceData.instance);
  const instantiating = useAppSelector((state) => state.instantiation.instantiating);
  const waitingToRedirectToInstance = useRef(false);

  const hasInstanceData =
    !!instanceData &&
    !(Array.isArray(instanceData) && instanceData.length === 0) &&
    !(instanceData && typeof instanceData === 'object' && Object.keys(instanceData).length === 0);

  if (path === 'instance' && waitingToRedirectToInstance.current) {
    waitingToRedirectToInstance.current = false;
  }

  if (path === 'root' && instantiating) {
    waitingToRedirectToInstance.current = true;
  } else if (path !== 'instance' && hasInstanceData && !instantiating && !waitingToRedirectToInstance.current) {
    // When you have instance data, but you're looking at some other route in the application, it can only mean that you
    // pressed the history back button in the browser. This breaks the application, so we reload the page to get you
    // back to the correct state.

    window.location.reload();
    return (
      <PresentationComponent
        header={langAsString('instantiate.starting')}
        type={ProcessTaskType.Unknown}
      >
        <AltinnContentLoader
          width='100%'
          height='400'
        >
          <AltinnContentIconFormData />
        </AltinnContentLoader>
      </PresentationComponent>
    );
  }

  return <>{children}</>;
}
