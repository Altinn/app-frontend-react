import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ChangeEvent } from 'react';

import { Checkbox, Heading, Spinner } from '@digdir/designsystemet-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { signingQueries } from 'src/layout/SigneeList/api';
import { authorizedOrganisationDetailsQuery } from 'src/layout/SigningStatusPanel/api';
import { OnBehalfOfChooser } from 'src/layout/SigningStatusPanel/OnBehalfOfChooser';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { useUserSignees } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';
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

  const { data: authorizedOrganizationDetails, isLoading: isApiLoading } = useQuery(
    authorizedOrganisationDetailsQuery(instanceOwnerPartyId!, instanceGuid!),
  );

  const userSignees = useUserSignees();
  const unSignedUserSignees = userSignees.filter((s) => !s.hasSigned);
  const unsignedAuthorizedOrgSignees =
    authorizedOrganizationDetails?.organisations.filter((org) =>
      unSignedUserSignees.some((s) => s.partyId === org.partyId),
    ) ?? emptyArray;

  const {
    mutate: handleSign,
    error,
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
      setOnBehalfOfOrg(null);
    },
    onError: () => {
      // TODO: handle error
    },
  });

  const [confirmReadDocuments, setConfirmReadDocuments] = useState(false);
  const [onBehalfOfOrg, setOnBehalfOfOrg] = useState<string | null>(null);

  // Set the organization number automatically when there's only one organization
  useEffect(() => {
    if (unsignedAuthorizedOrgSignees?.length === 1) {
      const singleOrg = unsignedAuthorizedOrgSignees[0];
      setOnBehalfOfOrg(singleOrg.orgNumber);
    }
  }, [unsignedAuthorizedOrgSignees]);

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
      errorMessage={error ? <Lang id='signing.error_signing' /> : undefined}
    >
      {(unsignedAuthorizedOrgSignees?.length ?? 0) > 1 && (
        <OnBehalfOfChooser
          currentUserSignee={unSignedUserSignees.find((s) => s.partyId === currentUserPartyId)}
          authorizedOrganizationDetails={unsignedAuthorizedOrgSignees}
          onBehalfOfOrg={onBehalfOfOrg}
          onChange={handleChange}
        />
      )}
      {unSignedUserSignees.length === 1 && unSignedUserSignees.at(0)?.organization && (
        <Heading
          level={1}
          size='2xs'
        >
          <Lang
            id='signing.submit_panel_single_org_choice'
            params={[unSignedUserSignees.at(0)?.organization ?? '']}
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
