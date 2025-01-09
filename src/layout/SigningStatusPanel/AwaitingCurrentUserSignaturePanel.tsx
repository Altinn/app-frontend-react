import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Checkbox } from '@digdir/designsystemet-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { SigningPanel } from 'src/layout/SigningStatusPanel/SigningPanel';
import { doPerformAction } from 'src/queries/queries';

export function AwaitingCurrentUserSignaturePanel({ nodeId }: { nodeId: string }) {
  const { partyId, instanceGuid } = useParams();
  const isAuthorised = useIsAuthorised();
  const canSign = isAuthorised('sign');
  const canReject = isAuthorised('reject');
  const selectedLanguage = useCurrentLanguage();
  const queryClient = useQueryClient();

  const { next, busy } = useProcessNavigation() ?? {};

  const { mutate: handleSign, error } = useMutation({
    mutationFn: async () => {
      if (partyId && instanceGuid) {
        return doPerformAction(partyId, instanceGuid, { action: 'sign' }, selectedLanguage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(signeeListQuery(partyId!, instanceGuid!));
    },
  });

  const [confirmReadDocuments, setConfirmReadDocuments] = useState(false);

  if (!canSign) {
    return <div>Something went wrong. Current user should sign, but does not have rights...</div>;
  }

  return (
    <SigningPanel
      variant='info'
      heading='Signer skjemaet'
      actionButton={
        <Button
          onClick={() => handleSign()}
          disabled={!confirmReadDocuments || busy}
          size='md'
          color='success'
        >
          Signer skjemaet
        </Button>
      }
      secondaryButton={
        canReject ? (
          <Button
            disabled={busy}
            size='md'
            onClick={() => next?.({ action: 'reject', nodeId })}
            variant='secondary'
            color='danger'
          >
            Avbryt signering
          </Button>
        ) : undefined
      }
      errorMessage={error ? 'Noe gikk galt under signeringen. Vennligst prøv igjen.' : undefined} // TODO: get this text from config? API?
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
