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
  const { data: signeeList, isLoading, error } = useQuery(signeeListQuery(instanceOwnerPartyId, instanceGuid, taskId));
  const currentUserPartyId = useCurrentParty()?.partyId;
  const { langAsString } = useLanguage();

  const isAuthorised = useIsAuthorised();
  const canSign = isAuthorised('sign');
  const canWrite = isAuthorised('write');

  const currentUserStatus = getCurrentUserStatus(signeeList, currentUserPartyId, canSign);
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

  if (isLoading) {
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

  if (error) {
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

function getCurrentUserStatus(
  signeeList: SigneeState[] | undefined,
  partyId: number | undefined,
  canSign: boolean,
): CurrentUserStatus {
  const currentUserSignee = signeeList?.find((signee) => signee.partyId === partyId);
  if (currentUserSignee?.hasSigned) {
    return 'signed';
  }

  if (canSign) {
    return 'awaitingSignature';
  }

  return 'notSigning';
}
