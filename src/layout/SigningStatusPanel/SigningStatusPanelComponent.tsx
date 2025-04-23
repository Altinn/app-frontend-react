import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';

import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useBackendValidationQuery } from 'src/features/validation/backendValidation/backendValidationQuery';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { authorizedOrganisationDetailsQuery } from 'src/layout/SigningStatusPanel/api';
import { AwaitingCurrentUserSignaturePanel } from 'src/layout/SigningStatusPanel/PanelAwaitingCurrentUserSignature';
import { AwaitingOtherSignaturesPanel } from 'src/layout/SigningStatusPanel/PanelAwaitingOtherSignatures';
import { NoActionRequiredPanel } from 'src/layout/SigningStatusPanel/PanelNoActionRequired';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import { SubmitPanel } from 'src/layout/SigningStatusPanel/PanelSubmit';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SigneeState } from 'src/layout/SigneeList/api';

const MissingSignaturesErrorCode = 'MissingSignatures' as const;

export function SigningStatusPanelComponent({ node }: PropsFromGenericComponent<'SigningStatusPanel'>) {
  const { instanceOwnerPartyId, instanceGuid, taskId } = useParams();
  const {
    data: signeeList,
    isLoading: isSigneeListLoading,
    error: signeeListError,
  } = useQuery(signeeListQuery(instanceOwnerPartyId, instanceGuid, taskId));

  const currentUserPartyId = useCurrentParty()?.partyId;
  const { langAsString } = useLanguage();

  const isAuthorised = useIsAuthorised();
  const canSign = isAuthorised('sign');
  const canWrite = isAuthorised('write');

  const userSignees = useUserSignees();
  const currentUserStatus = getCurrentUserStatus(currentUserPartyId, userSignees, canSign);
  const hasSigned = currentUserStatus === 'signed';

  const { refetch: refetchBackendValidations, data: hasMissingSignatures } = useBackendValidationQuery(
    {
      select: (data) => data?.some((validation) => validation.code === MissingSignaturesErrorCode),
    },
    false,
  );

  useEffect(() => {
    refetchBackendValidations();
  }, [refetchBackendValidations, signeeList]);

  if (isSigneeListLoading) {
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

  if (signeeListError) {
    return (
      <SigningPanel
        node={node}
        heading={<Lang id='signing.api_error_panel_title' />}
        description={<Lang id='signing.api_error_panel_description' />}
        variant='error'
      />
    );
  }

  const hasDelegationError = signeeList?.some((signee) => !signee.delegationSuccessful && !signee.hasSigned);
  if (hasDelegationError) {
    return (
      <SigningPanel
        node={node}
        heading={<Lang id='signing.delegation_error_panel_title' />}
        description={<Lang id='signing.delegation_error_panel_description' />}
        variant='error'
      />
    );
  }

  if (currentUserStatus === 'awaitingSignature') {
    return (
      <AwaitingCurrentUserSignaturePanel
        node={node}
        hasMissingSignatures={!!hasMissingSignatures}
      />
    );
  }

  // user either has signed or is not signing
  if (!canWrite) {
    return (
      <NoActionRequiredPanel
        node={node}
        hasSigned={hasSigned}
      />
    );
  }

  if (hasMissingSignatures) {
    return (
      <AwaitingOtherSignaturesPanel
        node={node}
        hasSigned={hasSigned}
      />
    );
  }

  return <SubmitPanel node={node} />;
}

export type CurrentUserStatus = 'awaitingSignature' | 'signed' | 'notSigning';

/**
 * Finds all signees in the signee list that the user can sign on behalf of.
 * This includes the user itself and any organizations the user is authorized to sign for.
 */
export function useUserSignees() {
  const { instanceOwnerPartyId, instanceGuid, taskId } = useParams();
  const { data: signeeList } = useQuery(signeeListQuery(instanceOwnerPartyId, instanceGuid, taskId));
  const { data: authorizedOrganisationDetails } = useQuery(
    authorizedOrganisationDetailsQuery(instanceOwnerPartyId!, instanceGuid!),
  );
  const currentUserPartyId = useCurrentParty()?.partyId;

  if (!signeeList || !currentUserPartyId) {
    return [];
  }

  // Get all party IDs the user can sign on behalf of (user + authorized organizations)
  const authorizedPartyIds = [currentUserPartyId];

  // Add organization party IDs if available
  if (authorizedOrganisationDetails?.organisations) {
    authorizedOrganisationDetails.organisations.forEach((org) => {
      authorizedPartyIds.push(org.partyId);
    });
  }

  // Find all signees that match the authorized party IDs
  return signeeList.filter((signee) => authorizedPartyIds.includes(signee.partyId));
}

/**
 * Calculates the current user's signing status based on the signees they can sign for.
 * Rules:
 * - If the user doesn't have permission for signing: "notSigning"
 * - If the user has one or more signees in the list that haven't already signed: "awaitingSignature"
 * - If the user doesn't have any signees that they can sign on behalf of: "notSigning"
 * - If the user has signed on behalf of all signees they can sign on behalf of: "signed"
 */
function getCurrentUserStatus(
  currentUserPartyId: number | undefined,
  userSignees: SigneeState[],
  canSign: boolean,
): CurrentUserStatus {
  // If the user doesn't have permission for signing
  if (!canSign) {
    return 'notSigning';
  }

  // If the current user is not listed as a signee, but they have sign permission, they should still be able to sign
  const currentUserIsInList = userSignees.some((signee) => signee.partyId === currentUserPartyId);
  if (!currentUserIsInList) {
    return 'awaitingSignature';
  }

  // If the user doesn't have any signees they can sign on behalf of, but they have sign permission
  if (userSignees.length === 0) {
    return 'notSigning';
  }

  // Check if there are any signees that haven't signed yet
  const hasUnsignedSignees = userSignees.some((signee) => !signee.hasSigned);
  if (hasUnsignedSignees) {
    return 'awaitingSignature';
  }

  // If all signees have signed
  return 'signed';
}
