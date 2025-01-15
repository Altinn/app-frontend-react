import React from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';

import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised, useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { AwaitingCurrentUserSignaturePanel } from 'src/layout/SigningStatusPanel/AwaitingCurrentUserSignaturePanel';
import { GoToInboxPanel } from 'src/layout/SigningStatusPanel/GoToInboxPanel';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { SubmitPanel } from 'src/layout/SigningStatusPanel/SubmitPanel';
import { ProcessTaskType } from 'src/types';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SigneeState } from 'src/layout/SigneeList/api';

export function SigningStatusPanelComponent({ node }: PropsFromGenericComponent<'SigningStatusPanel'>) {
  const taskType = useTaskTypeFromBackend();
  const { textResourceBindings } = useNodeItem(node);
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

  const allHaveSigned = signeeList?.every((signee) => signee.hasSigned) ?? false;

  if (currentUserStatus === 'awaitingSignature') {
    return (
      <AwaitingCurrentUserSignaturePanel
        texts={{
          checkboxLabel: textResourceBindings?.checkbox_label,
          checkboxDescription: textResourceBindings?.checkbox_description,
          title: textResourceBindings?.awaiting_signature_panel_title,
          signingButtonText: textResourceBindings?.sign_button,
        }}
      />
    );
  }

  if (canWrite) {
    return (
      <SubmitPanel
        nodeId={node.id}
        allHaveSigned={allHaveSigned}
        currentUserStatus={currentUserStatus}
        texts={{
          titleReadyForSubmit: textResourceBindings?.submit_panel_title_ready_for_submit,
          titleNotReadyForSubmit: textResourceBindings?.submit_panel_title_not_ready_for_submit,
          descriptionReadyForSubmit: textResourceBindings?.submit_panel_description_ready_for_submit,
          descriptionNotSigning: textResourceBindings?.submit_panel_description_not_signing,
          descriptionSigned: textResourceBindings?.submit_panel_description_signed,
        }}
      />
    );
  }

  return (
    <GoToInboxPanel
      currentUserStatus={currentUserStatus}
      texts={{
        titleHasSigned: textResourceBindings?.submit_panel_title_ready_for_submit,
        titleNotSigned: textResourceBindings?.submit_panel_title_not_ready_for_submit,
        descriptionHasSigned: textResourceBindings?.submit_panel_description_ready_for_submit,
        descriptionNotSigned: textResourceBindings?.submit_panel_description_not_signing,
        goToInboxButton: textResourceBindings?.submit_panel_description_signed,
      }}
    />
  );
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
