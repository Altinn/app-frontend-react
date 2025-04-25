import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '@digdir/designsystemet-react';

import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useSigneeList } from 'src/layout/SigneeList/api';
import { useSignaturesValidation, useUserSigneeParties } from 'src/layout/SigningStatusPanel/api';
import { AwaitingCurrentUserSignaturePanel } from 'src/layout/SigningStatusPanel/PanelAwaitingCurrentUserSignature';
import { AwaitingOtherSignaturesPanel } from 'src/layout/SigningStatusPanel/PanelAwaitingOtherSignatures';
import { NoActionRequiredPanel } from 'src/layout/SigningStatusPanel/PanelNoActionRequired';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import { SubmitPanel } from 'src/layout/SigningStatusPanel/PanelSubmit';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { getCurrentUserStatus } from 'src/layout/SigningStatusPanel/utils';
import type { PropsFromGenericComponent } from 'src/layout';

export function SigningStatusPanelComponent({ node }: PropsFromGenericComponent<'SigningStatusPanel'>) {
  const { instanceOwnerPartyId, instanceGuid, taskId } = useParams();
  const {
    data: signeeList,
    isLoading: isSigneeListLoading,
    error: signeeListError,
  } = useSigneeList(instanceOwnerPartyId, instanceGuid, taskId);

  const currentUserPartyId = useCurrentParty()?.partyId;
  const { langAsString } = useLanguage();

  const isAuthorised = useIsAuthorised();
  const canSign = isAuthorised('sign');
  const canWrite = useIsAuthorised()('write');

  const userSigneeParties = useUserSigneeParties();
  const currentUserStatus = getCurrentUserStatus(currentUserPartyId, userSigneeParties, canSign);

  const { refetchValidations, hasMissingSignatures } = useSignaturesValidation();

  useEffect(() => {
    refetchValidations();
  }, [refetchValidations, signeeList]);

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

  if (!canWrite) {
    return (
      <NoActionRequiredPanel
        node={node}
        hasSigned={currentUserStatus === 'signed'}
      />
    );
  }

  if (hasMissingSignatures) {
    return (
      <AwaitingOtherSignaturesPanel
        node={node}
        hasSigned={currentUserStatus === 'signed'}
      />
    );
  }

  return <SubmitPanel node={node} />;
}
