import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { ProcessWrapper } from 'src/components/wrappers/ProcessWrapper';
import { useAllowAnonymous } from 'src/features/applicationMetadata/getAllowAnonymous';
import { useApplicationSettings } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { Entrypoint } from 'src/features/entrypoint/Entrypoint';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useKeepAlive } from 'src/hooks/useKeepAlive';
import { selectAppName, selectAppOwner } from 'src/selectors/language';

import '@digdir/design-system-tokens/brand/altinn/tokens.css';

export function App() {
  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);
  const applicationSettings = useApplicationSettings();
  const allowAnonymous = useAllowAnonymous();

  useKeepAlive(applicationSettings?.appOidcProvider, allowAnonymous);

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

  return (
    <Routes>
      <Route
        path='/'
        element={<Entrypoint />}
      />
      <Route
        path='/partyselection/*'
        element={<PartySelection />}
      />
      <Route
        path='/instance/:partyId/:instanceGuid'
        element={
          <InstanceProvider>
            <ProcessWrapper />
          </InstanceProvider>
        }
      />
    </Routes>
  );
}
