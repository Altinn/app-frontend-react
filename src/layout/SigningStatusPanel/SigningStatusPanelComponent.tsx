import React from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';

import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised, useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { AwaitingCurrentUserSignaturePanel } from 'src/layout/SigningStatusPanel/AwaitingCurrentUserSignaturePanel';
import { GoToInboxPanel } from 'src/layout/SigningStatusPanel/GoToInboxPanel';
import { SubmitPanel } from 'src/layout/SigningStatusPanel/SubmitPanel';
import { ProcessTaskType } from 'src/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SigneeState } from 'src/layout/SigneeList/api';

export function SigningStatusPanelComponent({ node }: PropsFromGenericComponent<'SigningStatusPanel'>) {
  const taskType = useTaskTypeFromBackend();
  const { partyId, instanceGuid } = useParams();
  const { data: signeeList, isLoading } = useQuery(signeeListQuery(partyId!, instanceGuid!));
  const currentUserStatus = getCurrentUserStatus(signeeList, partyId);
  const canWrite = useIsAuthorised()('write');

  if (taskType !== ProcessTaskType.Signing) {
    return (
      <Lang
        id='signing.wrong_task_error'
        params={['SigningStatusPanel']}
      />
    );
  }

  if (isLoading) {
    return (
      <Panel
        variant='info'
        isOnBottom
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Spinner
            style={{ margin: 'auto', justifySelf: 'center' }}
            title='Loading signing state...'
          />
        </div>
      </Panel>
    );
  }

  const allHaveSigned = signeeList?.every((signee) => signee.hasSigned) ?? false;

  if (currentUserStatus === 'waiting') {
    return <AwaitingCurrentUserSignaturePanel />;
  }

  if (canWrite) {
    return (
      <SubmitPanel
        nodeId={node.id}
        allHaveSigned={allHaveSigned}
        currentUserStatus={currentUserStatus}
      />
    );
  }

  return <GoToInboxPanel currentUserStatus={currentUserStatus} />;
}

export type CurrentUserStatus = 'waiting' | 'signed' | 'notSigning';
function getCurrentUserStatus(signeeList: SigneeState[] | undefined, partyId: string | undefined): CurrentUserStatus {
  const currentUserSignee = signeeList?.find((signee) => signee.partyId.toString() === partyId);
  if (!currentUserSignee) {
    return 'notSigning';
  }
  if (currentUserSignee.hasSigned) {
    return 'signed';
  }
  return 'waiting';
}
