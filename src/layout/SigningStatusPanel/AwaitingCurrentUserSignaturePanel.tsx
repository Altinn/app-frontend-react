import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Checkbox } from '@digdir/designsystemet-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { SigningPanel } from 'src/layout/SigningStatusPanel/SigningPanel';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { doPerformAction } from 'src/queries/queries';

export function AwaitingCurrentUserSignaturePanel() {
  const { partyId, instanceGuid } = useParams();
  const isAuthorised = useIsAuthorised();
  const canSign = isAuthorised('sign');
  const selectedLanguage = useCurrentLanguage();
  const queryClient = useQueryClient();
  const { langAsString } = useLanguage();

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
    return langAsString('signing.error_missing_signing_rights');
  }

  return (
    <SigningPanel
      variant='info'
      heading={langAsString('signing.sign')}
      actionButton={
        <Button
          onClick={() => handleSign()}
          disabled={!confirmReadDocuments}
          size='md'
          color='success'
        >
          <Lang id='signing.sign' />
        </Button>
      }
      errorMessage={error ? langAsString('signing.error_signing') : undefined}
    >
      <Checkbox
        value={String(confirmReadDocuments)}
        onChange={() => setConfirmReadDocuments(!confirmReadDocuments)}
        className={classes.checkbox}
      >
        <Lang id='signing.confirm_read_documents' /> {/* TODO: get this text from config? API? */}
      </Checkbox>
    </SigningPanel>
  );
}
