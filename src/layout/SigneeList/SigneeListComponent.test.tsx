import React from 'react';

import { jest } from '@jest/globals';
import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { randomUUID } from 'crypto';
import type { UseQueryResult } from '@tanstack/react-query';

import { SigneeListComponent } from 'src/layout/SigneeList/SigneeListComponent';
import { ProcessTaskType } from 'src/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { fetchSigneeList } from 'src/layout/SigneeList/api';

const mockSigneeStates: Awaited<ReturnType<typeof fetchSigneeList>> = [
  {
    name: 'name',
    organisation: 'organisation',
    hasSigned: true,
    delegationSuccessful: true,
    notificationSuccessful: true,
    partyId: 123,
  },
  {
    name: 'name2',
    organisation: 'organisation2',
    hasSigned: false,
    delegationSuccessful: false,
    notificationSuccessful: false,
    partyId: 123,
  },
  {
    name: 'name3',
    organisation: 'organisation3',
    hasSigned: false,
    delegationSuccessful: true,
    notificationSuccessful: false,
    partyId: 123,
  },
  {
    name: 'name4',
    organisation: 'organisation4',
    hasSigned: false,
    delegationSuccessful: true,
    notificationSuccessful: true,
    partyId: 123,
  },
];

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
    partyId: 'partyId',
    instanceGuid: randomUUID(),
  })),
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
  useTaskTypeFromBackend: jest.fn(() => ProcessTaskType.Signing),
}));

jest.mock('src/layout/SigneeList/api');

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: mockSigneeStates,
    isLoading: false,
    error: undefined,
  })),
}));

jest.mock('src/layout/SigneeList/SigneeListError', () => ({
  SigneeListError: jest.fn(({ error }: { error: Error }) => error.message),
}));

const mockedUseQuery = jest.mocked(useQuery);

describe('SigneeListComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(
      <SigneeListComponent
        node={{} as PropsFromGenericComponent<'SigneeList'>['node']}
        containerDivRef={React.createRef()}
      />,
    );

    screen.getByRole('table', { name: /Signee List/ });
    screen.getByRole('columnheader', { name: 'signee_list.header_name' });
    screen.getByRole('columnheader', { name: 'signee_list.header_on_behalf_of' });
    screen.getByRole('columnheader', { name: 'signee_list.header_status' });

    expect(screen.getAllByRole('row')).toHaveLength(5);

    screen.getByRole('row', { name: 'name organisation signee_list.signee_status_signed' });
    screen.getByRole('row', { name: 'name2 organisation2 signee_list.signee_status_delegation_failed' });
    screen.getByRole('row', { name: 'name3 organisation3 signee_list.signee_status_notification_failed' });
    screen.getByRole('row', { name: 'name4 organisation4 signee_list.signee_status_waiting' });
  });

  it('should render error message when API call fails', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('API error'),
    } as UseQueryResult);

    render(
      <SigneeListComponent
        node={{} as PropsFromGenericComponent<'SigneeList'>['node']}
        containerDivRef={React.createRef()}
      />,
    );

    screen.getByText('API error');
  });

  it('should render spinner when loading', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as UseQueryResult);

    render(
      <SigneeListComponent
        node={{} as PropsFromGenericComponent<'SigneeList'>['node']}
        containerDivRef={React.createRef()}
      />,
    );

    screen.getByRole('table', { name: /Signee List/ });
    screen.getByRole('columnheader', { name: 'signee_list.header_name' });
    screen.getByRole('columnheader', { name: 'signee_list.header_on_behalf_of' });
    screen.getByRole('columnheader', { name: 'signee_list.header_status' });
    screen.getByRole('cell', { name: /loading data.../i });

    expect(screen.getAllByRole('row')).toHaveLength(2);
  });
});
