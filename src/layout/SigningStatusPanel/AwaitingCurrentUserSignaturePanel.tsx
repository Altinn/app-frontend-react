import React, { useState } from 'react';

import { Checkbox } from '@digdir/designsystemet-react';

import { Button } from 'src/app-components/Button/Button';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { SigningPanel } from 'src/layout/SigningStatusPanel/SigningPanel';

export function AwaitingCurrentUserSignaturePanel() {
  const isAuthorised = useIsAuthorised();
  const canWrite = isAuthorised('write');
  const canSign = isAuthorised('sign');

  const [confirmReadDocuments, setConfirmReadDocuments] = useState(false);

  if (!canSign) {
    return <div>Something went wrong. Current user should sign, but does not have rights...</div>;
  }

  function handleSign() {
    // TODO: implement
  }

  function handleReject() {
    // TODO: implement
  }

  return (
    <SigningPanel
      heading='Signer skjemaet'
      secondaryButton={
        canWrite ? (
          <Button
            onClick={handleReject}
            variant='secondary'
            color='danger'
          >
            Avbryt signering
          </Button>
        ) : undefined
      }
      actionButton={
        <Button
          onClick={handleSign}
          disabled={!confirmReadDocuments}
          color='success'
        >
          Signer skjemaet
        </Button>
      }
    >
      <Checkbox
        value={String(confirmReadDocuments)}
        onChange={() => setConfirmReadDocuments(!confirmReadDocuments)}
      >
        Jeg bekrefter at opplysningene og dokumentene er riktige. {/* TODO: get this text from config? API? */}
      </Checkbox>
    </SigningPanel>
  );
}
