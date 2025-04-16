import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ChangeEvent } from 'react';

import { Checkbox, Spinner } from '@digdir/designsystemet-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { authorizedOrganisationDetailsQuery } from 'src/layout/SigningStatusPanel/api';
import { OnBehalfOfChooser } from 'src/layout/SigningStatusPanel/OnBehalfOfChooser';
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
}: Readonly<AwaitingCurrentUserSignaturePanelProps>) {
  const { instanceOwnerPartyId, instanceGuid } = useParams();
  const isAuthorised = useIsAuthorised();
  const canSign = isAuthorised('sign');
  const canWrite = isAuthorised('write');

  const selectedLanguage = useCurrentLanguage();
  const queryClient = useQueryClient();
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);
  const { langAsString } = useLanguage();

  const title = textResourceBindings?.awaitingSignaturePanelTitle ?? 'signing.awaiting_signature_panel_title';
  const checkboxLabel = textResourceBindings?.checkboxLabel ?? 'signing.checkbox_label';
  const checkboxDescription = textResourceBindings?.checkboxDescription;
  const signingButtonText = textResourceBindings?.signingButton ?? 'signing.sign_button';

  const { data: authorizedOrganisationDetails, isLoading: isApiLoading } = useQuery(
    authorizedOrganisationDetailsQuery(instanceOwnerPartyId!, instanceGuid!),
  );

  const {
    mutate: handleSign,
    error,
    isSuccess,
    isPending,
  } = useMutation({
    mutationFn: async (onBehalfOf: string | null) => {
      if (instanceOwnerPartyId && instanceGuid) {
        return doPerformAction(
          instanceOwnerPartyId,
          instanceGuid,
          { action: 'sign', ...(onBehalfOf ? { onBehalfOf } : {}) },
          selectedLanguage,
          queryClient,
        );
      }
    },
  });

  const [confirmReadDocuments, setConfirmReadDocuments] = useState(false);
  const [onBehalfOfOrg, setOnBehalfOfOrg] = useState<string | null>(null);

  // Set the organization number automatically when there's only one organization
  useEffect(() => {
    if (authorizedOrganisationDetails?.organisations?.length === 1) {
      const singleOrg = authorizedOrganisationDetails.organisations[0];
      setOnBehalfOfOrg(singleOrg.orgNumber);
    }
  }, [authorizedOrganisationDetails]);

  // This shouldn't really happen, but if it does it indicates that our backend is out of sync with Autorisasjon somehow
  if (!canSign) {
    return <UnknownError />;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setOnBehalfOfOrg(event.target.value);
  }

  if (isApiLoading) {
    return (
      <Panel
        variant='info'
        isOnBottom
      >
        <div className={classes.loadingContainer}>
          <Spinner title={langAsString('signing.loading')} />
        </div>
      </Panel>
    );
  }

  return (
    <SigningPanel
      node={node}
      variant='info'
      heading={<Lang id={title} />}
      actionButton={
        <>
          <Button
            onClick={() => handleSign(onBehalfOfOrg)}
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
      <OnBehalfOfChooser
        authorizedOrganisationDetails={authorizedOrganisationDetails}
        onBehalfOfOrg={onBehalfOfOrg}
        onChange={handleChange}
      />
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
