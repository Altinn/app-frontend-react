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

type AwaitingCurrentUserSignaturePanelProps = {
  texts: {
    title?: string;
    checkboxLabel?: string;
    checkboxDescription?: string;
    signingButtonText?: string;
  };
};

export function AwaitingCurrentUserSignaturePanel({
  texts: {
    title = 'signing.awaiting_signature_panel_title',
    checkboxLabel = 'signing.checkbox_label',
    checkboxDescription,
    signingButtonText = 'signing.sign_button',
  },
}: AwaitingCurrentUserSignaturePanelProps) {
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
      heading={langAsString(title)}
      actionButton={
        <Button
          onClick={() => handleSign()}
          disabled={!confirmReadDocuments}
          size='md'
          color='success'
        >
          <Lang id={signingButtonText} />
        </Button>
      }
      description={checkboxDescription}
      errorMessage={error ? langAsString('signing.error_signing') : undefined}
    >
      <Checkbox
        value={String(confirmReadDocuments)}
        onChange={() => setConfirmReadDocuments(!confirmReadDocuments)}
        className={classes.checkbox}
      >
        <Lang id={checkboxLabel} />
      </Checkbox>
    </SigningPanel>
  );
}
