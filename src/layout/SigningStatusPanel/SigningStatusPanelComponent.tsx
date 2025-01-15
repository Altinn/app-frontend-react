import React from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';

import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised, useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { AwaitingCurrentUserSignaturePanel } from 'src/layout/SigningStatusPanel/PanelAwaitingCurrentUserSignature';
import { AwaitingOtherSignaturesPanel } from 'src/layout/SigningStatusPanel/PanelAwaitingOtherSignatures';
import { NoActionRequiredPanel } from 'src/layout/SigningStatusPanel/PanelNoActionRequired';
import { SubmitPanel } from 'src/layout/SigningStatusPanel/PanelSubmit';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { ProcessTaskType } from 'src/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SigneeState } from 'src/layout/SigneeList/api';

export function SigningStatusPanelComponent({ node }: PropsFromGenericComponent<'SigningStatusPanel'>) {
  const taskType = useTaskTypeFromBackend();
  const { partyId, instanceGuid } = useParams();
  const { data: signeeList, isLoading } = useQuery(signeeListQuery(partyId!, instanceGuid!));
  const currentUserStatus = getCurrentUserStatus(signeeList, partyId);
  const canWrite = useIsAuthorised()('write');
  const { langAsString } = useLanguage();

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
    <NoActionRequiredPanel
      node={node}
      currentUserStatus={currentUserStatus}
    />;
  }

  const allHaveSigned = signeeList?.every((signee) => signee.hasSigned) ?? false;
  if (allHaveSigned) {
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

function getCurrentUserStatus(signeeList: SigneeState[] | undefined, partyId: string | undefined): CurrentUserStatus {
  const currentUserSignee = signeeList?.find((signee) => signee.partyId.toString() === partyId);
  if (!currentUserSignee) {
    return 'notSigning';
  }
  if (currentUserSignee.hasSigned) {
    return 'signed';
  }
  return 'awaitingSignature';
}
