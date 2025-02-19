import React from 'react';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { randomUUID } from 'crypto';

import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { useBackendValidationQuery } from 'src/features/validation/backendValidation/backendValidationQuery';
import { SigneeState } from 'src/layout/SigneeList/api';
import { SigningStatusPanelComponent } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';
import { IActionType } from 'src/types/shared';
import { LayoutNode } from 'src/utils/layout/LayoutNode';

const failedDelegationSignee: SigneeState = {
  name: 'name2',
  organisation: 'organisation2',
  hasSigned: false,
  delegationSuccessful: false,
  notificationSuccessful: false,
  partyId: 123,
};

const failedNotificationSignee: SigneeState = {
  name: 'name3',
  organisation: 'organisation3',
  hasSigned: false,
  delegationSuccessful: true,
  notificationSuccessful: false,
  partyId: 123,
};

const signedSignee: SigneeState = {
  name: 'name',
  organisation: 'organisation',
  hasSigned: true,
  delegationSuccessful: true,
  notificationSuccessful: true,
  partyId: 123,
};

const notSignedSignee: SigneeState = {
  name: 'name4',
  organisation: 'organisation4',
  hasSigned: false,
  delegationSuccessful: true,
  notificationSuccessful: true,
  partyId: 123,
};

jest.mock('src/utils/layout/useNodeItem', () => ({
  useNodeItem: jest.fn(() => ({
    textResourceBindings: {
      title: 'Signee List',
      description: 'description',
      help: 'help',
    },
  })),
}));

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(() => ({
    partyId: '123',
    instanceGuid: randomUUID(),
    taskId: 'task_1',
  })),
}));

jest.mock('src/layout/SigneeList/api');
jest.mock('src/features/instance/ProcessNavigationContext', () => ({
  useProcessNavigation: jest.fn(() => ({
    navigateToTask: jest.fn(),
  })),
}));

jest.mock('src/core/contexts/AppQueriesProvider', () => ({
  useAppQueries: jest.fn(() => ({
    fetchLogo: jest.fn(),
  })),
}));

jest.mock('src/features/party/PartiesProvider', () => ({
  useCurrentParty: jest.fn(() => ({ partyId: 123 })),
}));

jest.mock('src/features/language/useLanguage', () => ({
  useLanguage: jest.fn(() => ({
    langAsString: (inputString: string) => inputString,
  })),
}));

jest.mock('src/features/language/Lang', () => ({
  Lang: ({ id }: { id: string }) => id,
}));

jest.mock('src/features/instance/ProcessContext', () => ({
  useIsAuthorised: jest.fn(() => () => true),
}));

jest.mock('src/features/validation/backendValidation/backendValidationQuery', () => ({
  useBackendValidationQuery: jest.fn(() => ({
    data: true,
    refetch: jest.fn(),
  })),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    error: null,
  })),
  useQueryClient: jest.fn(),
}));

const mockedUseQuery = jest.mocked(useQuery);
const mockedUseIsAuthorised = jest.mocked(useIsAuthorised);
const mockedBackendValidationQuery = jest.mocked(useBackendValidationQuery);

describe('SigningStatusPanelComponent', () => {
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
    screen.debug();
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
