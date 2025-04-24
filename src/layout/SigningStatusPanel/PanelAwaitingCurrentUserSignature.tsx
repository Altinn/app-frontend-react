import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Checkbox, Heading, Spinner } from '@digdir/designsystemet-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { signingQueries } from 'src/layout/SigneeList/api';
import { useAuthorizedOrganizationDetails } from 'src/layout/SigningStatusPanel/api';
import { OnBehalfOfChooser } from 'src/layout/SigningStatusPanel/OnBehalfOfChooser';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { useUserSigneeParties } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';
import { SubmitSigningButton } from 'src/layout/SigningStatusPanel/SubmitSigningButton';
import { doPerformAction } from 'src/queries/queries';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type AwaitingCurrentUserSignaturePanelProps = {
  node: LayoutNode<'SigningStatusPanel'>;
  hasMissingSignatures: boolean;
};

const emptyArray = [];

export function AwaitingCurrentUserSignaturePanel({
  node,
  hasMissingSignatures,
}: Readonly<AwaitingCurrentUserSignaturePanelProps>) {
  const { instanceOwnerPartyId, instanceGuid } = useParams();
  const isAuthorised = useIsAuthorised();
  const canSign = isAuthorised('sign');
  const canWrite = isAuthorised('write');

  const selectedLanguage = useCurrentLanguage();
  const currentUserPartyId = useCurrentParty()?.partyId;
  const queryClient = useQueryClient();
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);
  const { langAsString } = useLanguage();

  const title = textResourceBindings?.awaitingSignaturePanelTitle ?? 'signing.awaiting_signature_panel_title';
  const checkboxLabel = textResourceBindings?.checkboxLabel ?? 'signing.checkbox_label';
  const checkboxDescription = textResourceBindings?.checkboxDescription;
  const signingButtonText = textResourceBindings?.signingButton ?? 'signing.sign_button';

  const [confirmReadDocuments, setConfirmReadDocuments] = useState(false);
  // Set the org number automatically when there's only unsigned party and it is an org
  const [onBehalfOf, setOnBehalfOf] = useState<string | null>(null);

  const { data: authorizedOrganizationDetails, isLoading: isApiLoading } = useAuthorizedOrganizationDetails(
    instanceOwnerPartyId!,
    instanceGuid!,
  );

  const userSigneeParties = useUserSigneeParties();
  const unsignedUserSigneeParties = userSigneeParties.filter((party) => !party.hasSigned);
  const unsignedAuthorizedOrgSignees =
    authorizedOrganizationDetails?.organisations.filter((org) =>
      unsignedUserSigneeParties.some((s) => s.partyId === org.partyId),
    ) ?? emptyArray;

  const {
    mutate: handleSign,
    error: signingError,
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
    onSuccess: () => {
      // Refetch all queries related to signing to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: signingQueries.all });
      setConfirmReadDocuments(false);
      setOnBehalfOf(null);
    },
  });

  // if last party is an org, set the org number automatically
  useEffect(() => {
    if (
      unsignedUserSigneeParties.length === 1 &&
      unsignedUserSigneeParties[0].partyId === unsignedAuthorizedOrgSignees.at(0)?.partyId
    ) {
      setOnBehalfOf(unsignedAuthorizedOrgSignees[0].orgNumber);
    }
  }, [unsignedUserSigneeParties, unsignedAuthorizedOrgSignees]);

  // This shouldn't really happen, but if it does it indicates that our backend is out of sync with Autorisasjon somehow
  if (!canSign) {
    return <UnknownError />;
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
            onClick={() => handleSign(onBehalfOf)}
            disabled={!confirmReadDocuments || isPending}
            size='md'
            color='success'
          >
            <Lang id={signingButtonText} />
          </Button>
          {!hasMissingSignatures && canWrite && <SubmitSigningButton node={node} />}
        </>
      }
      description={<Lang id={checkboxDescription} />}
      errorMessage={signingError ? <Lang id='signing.error_signing' /> : undefined}
    >
      {unsignedUserSigneeParties.length > 1 && (
        <OnBehalfOfChooser
          currentUserSignee={unsignedUserSigneeParties.find((s) => s.partyId === currentUserPartyId)}
          authorizedOrganizationDetails={unsignedAuthorizedOrgSignees}
          onBehalfOfOrg={onBehalfOf}
          onChange={(e) => setOnBehalfOf(e.target.value)}
        />
      )}
      {unsignedUserSigneeParties.length === 1 && unsignedUserSigneeParties.at(0)?.organization && (
        <Heading
          level={1}
          size='2xs'
        >
          <Lang
            id='signing.submit_panel_single_org_choice'
            params={[unsignedUserSigneeParties.at(0)?.organization ?? '']}
          />
        </Heading>
      )}
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
