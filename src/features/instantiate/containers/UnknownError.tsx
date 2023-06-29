import React from 'react';
import { useDispatch } from 'react-redux';

import { Button } from '@digdir/design-system-react';

import { DevToolsActions } from 'src/features/devtools/data/devToolsSlice';
import { DevToolsTab } from 'src/features/devtools/data/types';
import { InstantiationErrorPage } from 'src/features/instantiate/containers/InstantiationErrorPage';
import { useLanguage } from 'src/hooks/useLanguage';

const devHostNames = ['local.altinn.cloud', 'dev.altinn.studio', 'altinn.studio', 'studio.localhost', 'tt02.altinn.no'];
const isDev = devHostNames.some((host) => window.location.hostname.endsWith(host));

export function UnknownError() {
  const { lang, langAsString } = useLanguage();
  const dispatch = useDispatch();

  function openLog() {
    dispatch(DevToolsActions.open());
    dispatch(DevToolsActions.setActiveTab({ tabName: DevToolsTab.Logs }));
  }

  const createUnknownErrorContent = (): JSX.Element => {
    const customerSupport = lang('instantiate.unknown_error_customer_support', [
      langAsString('general.customer_service_phone_number'),
    ]);

    return (
      <>
        {lang('instantiate.unknown_error_text')}
        <br />
        <br />
        {customerSupport}
        {isDev && (
          <>
            <br />
            <br />
            Sjekk loggen for mer informasjon.
            <br />
            <br />
            <Button onClick={openLog}>Vis logg</Button>
          </>
        )}
      </>
    );
  };

  return (
    <InstantiationErrorPage
      title={lang('instantiate.unknown_error_title')}
      content={createUnknownErrorContent()}
      statusCode={langAsString('instantiate.unknown_error_status')}
    />
  );
}
