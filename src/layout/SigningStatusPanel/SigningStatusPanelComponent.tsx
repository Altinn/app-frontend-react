import React from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';

import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { useLanguage } from 'src/features/language/useLanguage';
import { useProfile } from 'src/features/profile/ProfileProvider';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { AwaitingCurrentUserSignaturePanel } from 'src/layout/SigningStatusPanel/PanelAwaitingCurrentUserSignature';
import { AwaitingOtherSignaturesPanel } from 'src/layout/SigningStatusPanel/PanelAwaitingOtherSignatures';
import { NoActionRequiredPanel } from 'src/layout/SigningStatusPanel/PanelNoActionRequired';
import { SubmitPanel } from 'src/layout/SigningStatusPanel/PanelSubmit';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SigneeState } from 'src/layout/SigneeList/api';

export function SigningStatusPanelComponent({ node }: PropsFromGenericComponent<'SigningStatusPanel'>) {
  const { partyId, instanceGuid } = useParams();
  const { data: signeeList, isLoading } = useQuery(signeeListQuery(partyId!, instanceGuid!));
  const profile = useProfile();
  const currentUserpartyId = profile?.partyId;
  const currentUserStatus = getCurrentUserStatus(signeeList, currentUserpartyId);
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

  const allHaveSigned = signeeList?.every((signee) => signee.hasSigned) ?? false;
  if (allHaveSigned) {
    return <SubmitPanel node={node} />;
  }

  return (
    <AwaitingOtherSignaturesPanel
      node={node}
      currentUserStatus={currentUserStatus}
    />
  );
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
