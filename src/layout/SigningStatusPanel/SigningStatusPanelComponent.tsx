import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';

import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { useLanguage } from 'src/features/language/useLanguage';
import { useProfile } from 'src/features/profile/ProfileProvider';
import { useBackendValidationQuery } from 'src/features/validation/backendValidation/backendValidationQuery';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { AwaitingCurrentUserSignaturePanel } from 'src/layout/SigningStatusPanel/PanelAwaitingCurrentUserSignature';
import { AwaitingOtherSignaturesPanel } from 'src/layout/SigningStatusPanel/PanelAwaitingOtherSignatures';
import { NoActionRequiredPanel } from 'src/layout/SigningStatusPanel/PanelNoActionRequired';
import { SubmitPanel } from 'src/layout/SigningStatusPanel/PanelSubmit';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SigneeState } from 'src/layout/SigneeList/api';

const MissingSignaturesErrorCode = 'MissingSignatures' as const;

export function SigningStatusPanelComponent({ node }: PropsFromGenericComponent<'SigningStatusPanel'>) {
  const { partyId, instanceGuid } = useParams();
  const { data: signeeList, isLoading } = useQuery(signeeListQuery(partyId!, instanceGuid!));
  const profile = useProfile();
  const currentUserPartyId = profile?.partyId;
  const currentUserStatus = getCurrentUserStatus(signeeList, currentUserPartyId);

  const { refetch: refetchBackendValidations, data: hasMissingSignatures } = useBackendValidationQuery(
    {
      select: (data) => data?.some((validation) => validation.code === MissingSignaturesErrorCode),
    },
    false,
  );

  useEffect(() => {
    refetchBackendValidations();
  }, [refetchBackendValidations, signeeList]);
  const canWrite = useIsAuthorised()('write');
  const { langAsString } = useLanguage();

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

  if (currentUserStatus === 'awaitingSignature') {
    return <AwaitingCurrentUserSignaturePanel node={node} />;
  }

  if (!canWrite) {
    return (
      <NoActionRequiredPanel
        node={node}
        currentUserStatus={currentUserStatus}
      />
    );
  }

  if (hasMissingSignatures) {
    return (
      <AwaitingOtherSignaturesPanel
        node={node}
        currentUserStatus={currentUserStatus}
      />
    );
  }

  return <SubmitPanel node={node} />;
}

export type CurrentUserStatus = 'awaitingSignature' | 'signed' | 'notSigning';

function getCurrentUserStatus(signeeList: SigneeState[] | undefined, partyId: number | undefined): CurrentUserStatus {
  const currentUserSignee = signeeList?.find((signee) => signee.partyId === partyId);
  if (!currentUserSignee) {
    return 'notSigning';
  }
  if (currentUserSignee.hasSigned) {
    return 'signed';
  }
  return 'awaitingSignature';
}
