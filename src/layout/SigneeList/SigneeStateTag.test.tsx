import React from 'react';

import { jest } from '@jest/globals';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

import { NotificationStatus } from 'src/layout/SigneeList/api';
import { SIGNEE_STATUS, SigneeStateTag } from 'src/layout/SigneeList/SigneeStateTag';

jest.mock('src/features/language/Lang', () => ({ Lang: ({ id }: { id: string }) => id }));

describe('SigneeStateTag', () => {
  it('should display a tag with name "signed" when status is "signed"', () => {
    render(
      <SigneeStateTag
        state={{
          hasSigned: true,
          delegationSuccessful: true,
          notificationStatus: NotificationStatus.Sent,
          partyId: 123,
        }}
      />,
    );

    screen.getByText(SIGNEE_STATUS.signed);
  });

  it('should display a tag with name "delegationFailed" when status is "delegationFailed"', () => {
    render(
      <SigneeStateTag
        state={{
          hasSigned: false,
          delegationSuccessful: false,
          notificationStatus: NotificationStatus.NotSent,
          partyId: 123,
        }}
      />,
    );

    screen.getByText(SIGNEE_STATUS.delegationFailed);
  });

  it('should display a tag with name "notificationFailed" when status is "notificationFailed"', () => {
    render(
      <SigneeStateTag
        state={{
          hasSigned: false,
          delegationSuccessful: true,
          notificationStatus: NotificationStatus.Failed,
          partyId: 123,
        }}
      />,
    );

    screen.getByText(SIGNEE_STATUS.notificationFailed);
  });

  it('should display a tag with name "waiting" when status is "waiting"', () => {
    render(
      <SigneeStateTag
        state={{
          hasSigned: false,
          delegationSuccessful: true,
          notificationStatus: NotificationStatus.Sent,
          partyId: 123,
        }}
      />,
    );

    screen.getByText(SIGNEE_STATUS.waiting);
  });
});
