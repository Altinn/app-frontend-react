import React from 'react';
import { useParams } from 'react-router-dom';

import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { randomUUID } from 'crypto';

import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { useProcessNext } from 'src/features/instance/useProcessNext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useBackendValidationQuery } from 'src/features/validation/backendValidation/backendValidationQuery';
import { NotificationStatus, SigneeState } from 'src/layout/SigneeList/api';
import { SigningStatusPanelComponent } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';
import { IActionType } from 'src/types/shared';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import { useNodeItem } from 'src/utils/layout/useNodeItem';

jest.mock('src/utils/layout/useNodeItem');
jest.mock('react-router-dom');
jest.mock('src/layout/SigneeList/api');
jest.mock('src/features/instance/useProcessNext.tsx');
jest.mock('src/core/contexts/AppQueriesProvider');
jest.mock('src/features/party/PartiesProvider');
jest.mock('src/features/language/useLanguage');
jest.mock('src/features/language/Lang');
jest.mock('src/features/instance/ProcessContext');
jest.mock('src/features/validation/backendValidation/backendValidationQuery');
jest.mock('@tanstack/react-query');

const mockedUseQuery = jest.mocked(useQuery);
const mockedUseIsAuthorised = jest.mocked(useIsAuthorised);
const mockedBackendValidationQuery = jest.mocked(useBackendValidationQuery);

const failedDelegationSignee: SigneeState = {
  name: 'name2',
  organization: 'organization2',
  signedTime: null,
  hasSigned: false,
  delegationSuccessful: false,
  notificationStatus: NotificationStatus.NotSent,
  partyId: 123,
};

const failedNotificationSignee: SigneeState = {
  name: 'name3',
  organization: 'organization3',
  signedTime: null,
  hasSigned: false,
  delegationSuccessful: true,
  notificationStatus: NotificationStatus.Failed,
  partyId: 123,
};

const signedSignee: SigneeState = {
  name: 'name',
  organization: 'organization',
  signedTime: new Date().toISOString(),
  hasSigned: true,
  delegationSuccessful: true,
  notificationStatus: NotificationStatus.Sent,
  partyId: 123,
};

const notSignedSignee: SigneeState = {
  name: 'name4',
  organization: 'organization4',
  signedTime: null,
  hasSigned: false,
  delegationSuccessful: true,
  notificationStatus: NotificationStatus.Sent,
  partyId: 123,
};

describe('SigningStatusPanelComponent', () => {
  beforeEach(() => {
    // resets all mocked functions to jest.fn()
    jest.resetAllMocks();

    jest.mocked(useNodeItem).mockReturnValue({
      textResourceBindings: {
        title: 'Signee List',
        description: 'description',
        help: 'help',
      },
    } as unknown as ReturnType<typeof useNodeItem>);

    jest.mocked(useQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult);

    jest.mocked(useMutation).mockReturnValue({
      mutate: jest.fn(),
      error: null,
    } as unknown as ReturnType<typeof useMutation>);

    jest.mocked(useParams).mockReturnValue({
      partyId: '123',
      instanceGuid: randomUUID(),
      taskId: 'task_1',
    });
    jest.mocked(useIsAuthorised).mockReturnValue(() => true);

    jest.mocked(useLanguage).mockReturnValue({
      langAsString: (inputString: string) => inputString,
    } as unknown as ReturnType<typeof useLanguage>);

    jest.mocked(useBackendValidationQuery).mockReturnValue({
      data: true,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBackendValidationQuery>);

    jest.mocked(Lang).mockImplementation(({ id }: { id: string }) => id);

    jest.mocked(useCurrentParty).mockReturnValue({ partyId: 123 } as unknown as ReturnType<typeof useCurrentParty>);

    jest.mocked(useProcessNext).mockReturnValue(jest.fn());
  });

  it('should render loading spinner when loading is true', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as UseQueryResult);

    render(
      <SigningStatusPanelComponent
        node={{} as LayoutNode<'SigningStatusPanel'>}
        containerDivRef={React.createRef()}
      />,
    );

    expect(screen.getByText('signing.loading')).toBeInTheDocument();
  });

  it('should render error panel when any signee has delegation failed', () => {
    mockedUseQuery.mockReturnValue({
      data: [failedDelegationSignee, failedNotificationSignee],
      isLoading: false,
      error: undefined,
    } as unknown as UseQueryResult);

    render(
      <SigningStatusPanelComponent
        node={{} as LayoutNode<'SigningStatusPanel'>}
        containerDivRef={React.createRef()}
      />,
    );

    expect(screen.getByText('signing.delegation_error_panel_title')).toBeInTheDocument();
    expect(screen.getByText('signing.delegation_error_panel_description')).toBeInTheDocument();
  });

  it('should render error panel on API error', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('API error'),
    } as unknown as UseQueryResult);

    render(
      <SigningStatusPanelComponent
        node={{} as LayoutNode<'SigningStatusPanel'>}
        containerDivRef={React.createRef()}
      />,
    );

    expect(screen.getByText('signing.api_error_panel_title')).toBeInTheDocument();
    expect(screen.getByText('signing.api_error_panel_description')).toBeInTheDocument();
  });

  it('should render awaiting signature panel when user is awaiting signature', () => {
    mockedUseQuery.mockReturnValue({
      data: [notSignedSignee],
      isLoading: false,
      error: undefined,
    } as unknown as UseQueryResult);

    render(
      <SigningStatusPanelComponent
        node={{} as LayoutNode<'SigningStatusPanel'>}
        containerDivRef={React.createRef()}
      />,
    );

    expect(screen.getByText('signing.awaiting_signature_panel_title')).toBeInTheDocument();
  });

  it('should render awaiting signature panel when user is not in signee list, but has sign access', () => {
    mockedUseIsAuthorised.mockImplementation(() => (action: IActionType) => (action === 'sign' ? true : false));

    mockedUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as unknown as UseQueryResult);

    render(
      <SigningStatusPanelComponent
        node={{} as LayoutNode<'SigningStatusPanel'>}
        containerDivRef={React.createRef()}
      />,
    );

    expect(screen.getByText('signing.awaiting_signature_panel_title')).toBeInTheDocument();
  });

  it('should render awaiting signature panel with submit button when user is awaiting signature, there are no missing signatures and the user has write access', () => {
    mockedUseIsAuthorised.mockReturnValue(() => true);
    mockedBackendValidationQuery.mockReturnValue({ data: false, refetch: jest.fn() } as unknown as UseQueryResult);
    mockedUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as unknown as UseQueryResult);

    render(
      <SigningStatusPanelComponent
        node={{} as LayoutNode<'SigningStatusPanel'>}
        containerDivRef={React.createRef()}
      />,
    );

    expect(screen.getByText('signing.awaiting_signature_panel_title')).toBeInTheDocument();
    expect(screen.getByText('signing.sign_button')).toBeInTheDocument();
    expect(screen.getByText('signing.submit_button')).toBeInTheDocument();
  });

  it('should render no action required panel with correct text when user has signed and does not have write access', () => {
    mockedUseIsAuthorised.mockImplementation(() => (action: IActionType) => (action === 'write' ? false : true));

    mockedUseQuery.mockReturnValue({
      data: [signedSignee],
      isLoading: false,
      error: undefined,
    } as unknown as UseQueryResult);

    render(
      <SigningStatusPanelComponent
        node={{} as LayoutNode<'SigningStatusPanel'>}
        containerDivRef={React.createRef()}
      />,
    );

    expect(screen.getByText('signing.no_action_required_panel_title_has_signed')).toBeInTheDocument();
  });

  it('should render no action required panel with correct text when user should not sign and does not have write access', () => {
    mockedUseIsAuthorised.mockImplementation(() => () => false);

    mockedUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as unknown as UseQueryResult);

    render(
      <SigningStatusPanelComponent
        node={{} as LayoutNode<'SigningStatusPanel'>}
        containerDivRef={React.createRef()}
      />,
    );

    expect(screen.getByText('signing.no_action_required_panel_title_not_signed')).toBeInTheDocument();
  });

  it('should render awaiting other signatures panel when user has signed, has write access and there are missing signatures', () => {
    mockedUseIsAuthorised.mockImplementation(() => () => true);

    mockedUseQuery.mockReturnValue({
      data: [signedSignee, { ...notSignedSignee, partyId: 124 }],
      isLoading: false,
      error: undefined,
    } as unknown as UseQueryResult);

    render(
      <SigningStatusPanelComponent
        node={{} as LayoutNode<'SigningStatusPanel'>}
        containerDivRef={React.createRef()}
      />,
    );

    expect(screen.getByText('signing.awaiting_other_signatures_panel_title')).toBeInTheDocument();
  });

  it('should render awaiting other signatures panel when user is not signing, has write access and validator returns missing signatures', () => {
    mockedUseIsAuthorised.mockImplementation(() => (action: IActionType) => (action === 'sign' ? false : true));

    mockedUseQuery.mockReturnValue({
      data: [{ ...notSignedSignee, partyId: 124 }],
      isLoading: false,
      error: undefined,
    } as unknown as UseQueryResult);

    render(
      <SigningStatusPanelComponent
        node={{} as LayoutNode<'SigningStatusPanel'>}
        containerDivRef={React.createRef()}
      />,
    );

    expect(screen.getByText('signing.awaiting_other_signatures_panel_title')).toBeInTheDocument();
  });

  it('should render submit panel when validator does not return missing signatures', () => {
    mockedUseQuery.mockReturnValue({
      data: [signedSignee],
      isLoading: false,
      error: undefined,
    } as unknown as UseQueryResult);
    mockedBackendValidationQuery.mockReturnValue({ data: false, refetch: jest.fn() } as unknown as UseQueryResult);

    render(
      <SigningStatusPanelComponent
        node={{} as LayoutNode<'SigningStatusPanel'>}
        containerDivRef={React.createRef()}
      />,
    );

    expect(screen.getByText('signing.submit_panel_title')).toBeInTheDocument();
  });
});
