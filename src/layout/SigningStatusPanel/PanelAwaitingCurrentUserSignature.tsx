import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Checkbox } from '@digdir/designsystemet-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { SubmitSigningButton } from 'src/layout/SigningStatusPanel/SubmitSigningButton';
import { doPerformAction } from 'src/queries/queries';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type AwaitingCurrentUserSignaturePanelProps = {
  node: LayoutNode<'SigningStatusPanel'>;
  hasMissingSignatures: boolean;
};

export function AwaitingCurrentUserSignaturePanel({
  node,
  hasMissingSignatures,
}: AwaitingCurrentUserSignaturePanelProps) {
  const { instanceOwnerPartyId, instanceGuid } = useParams();
  const isAuthorised = useIsAuthorised();
  const canSign = isAuthorised('sign');
  const canWrite = isAuthorised('write');

  const selectedLanguage = useCurrentLanguage();
  const queryClient = useQueryClient();
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);

  const title = textResourceBindings?.awaitingSignaturePanelTitle ?? 'signing.awaiting_signature_panel_title';
  const checkboxLabel = textResourceBindings?.checkboxLabel ?? 'signing.checkbox_label';
  const checkboxDescription = textResourceBindings?.checkboxDescription;
  const signingButtonText = textResourceBindings?.signingButton ?? 'signing.sign_button';

  const {
    mutate: handleSign,
    error,
    isSuccess,
    isPending,
  } = useMutation({
    mutationFn: async () => {
      if (instanceOwnerPartyId && instanceGuid) {
        return doPerformAction(instanceOwnerPartyId, instanceGuid, { action: 'sign' }, selectedLanguage, queryClient);
      }
    },
  });

  const [confirmReadDocuments, setConfirmReadDocuments] = useState(false);

  // This shouldn't really happen, but if it does it indicates that our backend is out of sync with Autorisasjon somehow
  if (!canSign) {
    return <UnknownError />;
  }

  return (
    <SigningPanel
      node={node}
      variant='info'
      heading={<Lang id={title} />}
      actionButton={
        <>
          <Button
            onClick={() => handleSign()}
            disabled={!confirmReadDocuments || isPending || isSuccess}
            size='md'
            color='success'
          >
            <Lang id={signingButtonText} />
          </Button>
          {!hasMissingSignatures && canWrite && <SubmitSigningButton node={node} />}
        </>
      }
      description={<Lang id={checkboxDescription} />}
      errorMessage={error ? <Lang id='signing.error_signing' /> : undefined}
    >
      <Checkbox
        value={String(confirmReadDocuments)}
        checked={confirmReadDocuments}
        onChange={() => setConfirmReadDocuments(!confirmReadDocuments)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setConfirmReadDocuments(!confirmReadDocuments);
          }
        }}
        className={classes.checkbox}
      >
        <Lang id={checkboxLabel} />
      </Checkbox>
    </SigningPanel>
  );
}
