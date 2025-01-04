import React from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { Panel } from 'src/app-components/Panel/Panel';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { useIsAuthorised, useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { AwaitingCurrentUserSignaturePanel } from 'src/layout/SigningStatusPanel/AwaitingCurrentUserSignaturePanel';
import { SigningPanel } from 'src/layout/SigningStatusPanel/SigningPanel';
import { ProcessTaskType } from 'src/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SigneeState } from 'src/layout/SigneeList/api';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <FullWidthWrapper isOnBottom={true}>
        <Panel variant='info'>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Spinner
              style={{ margin: 'auto', justifySelf: 'center' }}
              title='Loading signing state...'
            />
          </div>
        </Panel>
      </FullWidthWrapper>
    );
  }

  const allHaveSigned = signeeList?.every((signee) => signee.hasSigned) ?? false;

  if (currentUserStatus === 'waiting') {
    return <AwaitingCurrentUserSignaturePanel />;
  }

  if (canWrite) {
    return (
      <SigningPanelWriteAccess
        allHaveSigned={allHaveSigned}
        currentUserStatus={currentUserStatus}
      />
    );
  }

  return (
    <SigningPanelNoWriteAccess
      allHaveSigned={allHaveSigned}
      currentUserStatus={currentUserStatus}
    />
  );
}

function SigningPanelWriteAccess({
  allHaveSigned,
  currentUserStatus,
}: {
  allHaveSigned: boolean;
  currentUserStatus: Exclude<CurrentUserStatus, 'waiting'>;
}) {
  function handleRejectSigning() {
    // TODO: implement
  }

  function handleSubmit() {
    // TODO: implement
  }
  const description = allHaveSigned
    ? 'Alle har signert! Velg send inn skjemaet for å fullføre.'
    : [
        currentUserStatus === 'signed' ? 'Takk for at du har signert!' : null,
        'Når alle har signert kan du sende inn skjemaet.',
      ]
        .filter((it) => it != null)
        .join(' ');

  return (
    <SigningPanel
      variant={currentUserStatus === 'signed' ? 'success' : 'info'}
      heading={allHaveSigned ? 'Det er klart for å sende inn skjemaet' : 'Venter på andre som skal signere'}
      description={description}
      secondaryButton={
        <Button
          onClick={handleRejectSigning}
          variant='secondary'
          color='danger'
        >
          Avbryt signering
        </Button>
      }
      actionButton={
        <Button
          onClick={handleSubmit}
          color='success'
          disabled={!allHaveSigned}
        >
          Send inn skjemaet
        </Button>
      }
    />
  );
}

function SigningPanelNoWriteAccess({
  allHaveSigned,
  currentUserStatus,
}: {
  allHaveSigned: boolean;
  currentUserStatus: Exclude<CurrentUserStatus, 'waiting'>;
}) {
  function handleGoToInbox() {
    // TODO: implement
  }

  const hasSigned = currentUserStatus === 'signed';
  return (
    <SigningPanel
      variant={hasSigned ? 'success' : 'info'}
      heading={
        hasSigned
          ? 'Skjemaet er signert og sendt inn'
          : allHaveSigned
            ? 'Det er klart for å sende inn skjemaet'
            : 'Venter på at alle parter skal signere'
      }
      description={
        hasSigned
          ? 'Alt i orden! Du kan nå gå tilbake til innboksen.'
          : allHaveSigned
            ? 'Alle parter har signert.'
            : undefined
      }
      actionButton={
        <Button
          color='first'
          onClick={handleGoToInbox}
        >
          Gå til innboksen
        </Button>
      }
    />
  );
}

type CurrentUserStatus = 'waiting' | 'signed' | 'notSigning';
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
