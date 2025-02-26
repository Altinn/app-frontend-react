import React from 'react';
import { useParams } from 'react-router-dom';

import { jest } from '@jest/globals';
import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { randomUUID } from 'crypto';
import type { UseQueryResult } from '@tanstack/react-query';

import { useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { type fetchSigneeList, NotificationStatus } from 'src/layout/SigneeList/api';
import { SigneeListComponent } from 'src/layout/SigneeList/SigneeListComponent';
import { SigneeListError } from 'src/layout/SigneeList/SigneeListError';
import { ProcessTaskType } from 'src/types';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

const mockSigneeStates: Awaited<ReturnType<typeof fetchSigneeList>> = [
  {
    name: 'name',
    organisation: 'organisation',
    hasSigned: true,
    delegationSuccessful: true,
    notificationStatus: NotificationStatus.Sent,
    partyId: 123,
  },
  {
    name: 'name2',
    organisation: 'organisation2',
    hasSigned: false,
    delegationSuccessful: false,
    notificationStatus: NotificationStatus.Failed,
    partyId: 123,
  },
  {
    name: 'name3',
    organisation: 'organisation3',
    hasSigned: false,
    delegationSuccessful: true,
    notificationStatus: NotificationStatus.Failed,
    partyId: 123,
  },
  {
    name: 'name4',
    organisation: 'organisation4',
    hasSigned: false,
    delegationSuccessful: true,
    notificationStatus: NotificationStatus.NotSent,
    partyId: 123,
  },
];

jest.mock('src/utils/layout/useNodeItem');
jest.mock('react-router-dom');
jest.mock('src/features/language/useLanguage');
jest.mock('src/features/language/Lang');
jest.mock('src/features/instance/ProcessContext');
jest.mock('src/layout/SigneeList/api');
jest.mock('@tanstack/react-query');
jest.mock('src/layout/SigneeList/SigneeListError');

const mockedUseQuery = jest.mocked(useQuery);

describe('SigneeListComponent', () => {
  beforeEach(() => {
    // resets all mocked functions to jest.fn()
    jest.resetAllMocks();

    // eslint-disable-next-line react/jsx-no-useless-fragment
    jest.mocked(SigneeListError).mockImplementation(({ error }: { error: Error }) => <>{error.message}</>);

    jest.mocked(useTaskTypeFromBackend).mockReturnValue(ProcessTaskType.Signing);
    jest.mocked(Lang).mockImplementation(({ id }: { id: string }) => id);
    jest.mocked(useLanguage).mockReturnValue({
      langAsString: (inputString: string) => inputString,
    } as unknown as ReturnType<typeof useLanguage>);
    jest.mocked(useParams).mockReturnValue({
      partyId: 'partyId',
      instanceGuid: randomUUID(),
    });
    jest.mocked(useNodeItem).mockReturnValue({
      textResourceBindings: {
        title: 'Signee List',
        description: 'description',
        help: 'help',
      },
    } as ReturnType<typeof useNodeItem>);
  });

  it('should render correctly', () => {
    mockedUseQuery.mockReturnValue({
      data: mockSigneeStates,
      isLoading: false,
      error: undefined,
    } as unknown as UseQueryResult);

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
