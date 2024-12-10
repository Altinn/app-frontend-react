import React from 'react';

import { Tag } from '@digdir/designsystemet-react';
import type { TagProps } from '@digdir/designsystemet-react';

import { Lang } from 'src/features/language/Lang';
import type { SigneeState } from 'src/layout/SigneeList/SigneeListComponent';

const SIGNEE_STATUS = {
  signed: 'signee_list.signee_status_signed',
  waiting: 'signee_list.signee_status_waiting',
  delegationFailed: 'signee_list.signee_status_delegation_failed',
  notificationFailed: 'signee_list.signee_status_notification_failed',
} as const;

export type SigneeStatus = keyof typeof SIGNEE_STATUS;

function getSigneeStatus(state: SigneeState): SigneeStatus {
  if (state.hasSigned) {
    return 'signed';
  }
  if (!state.delegationSuccessful) {
    return 'delegationFailed';
  }
  if (!state.notificationSuccessful) {
    return 'notificationFailed';
  }
  return 'waiting';
}

export function SigneeStateTag({ state }: { state: SigneeState }) {
  const status = getSigneeStatus(state);

  let color: TagProps['color'] = 'neutral';
  switch (status) {
    case 'signed':
      color = 'success';
      break;
    case 'delegationFailed':
      color = 'danger';
      break;
    case 'notificationFailed':
      color = 'warning';
      break;
    default:
      color = 'neutral';
  }

  return (
    <Tag
      color={color}
      size='sm'
    >
      <Lang id={SIGNEE_STATUS[status]} />
    </Tag>
  );
}
