import React from 'react';
import { useParams } from 'react-router-dom';

import { jest } from '@jest/globals';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

import { Lang } from 'src/features/language/Lang';
import { NotificationStatus, SigneeState } from 'src/layout/SigneeList/api';
import { SigneeListSummary } from 'src/layout/SigneeList/SigneeListSummary';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import { useNodeItem } from 'src/utils/layout/useNodeItem';

jest.mock('src/layout/SigneeList/api');
jest.mock('react-router-dom');
jest.mock('src/utils/layout/useNodeItem');
jest.mock('src/features/language/Lang');
jest.mock('@tanstack/react-query');

describe('SigneeListSummary', () => {
  const mockedUseQuery = jest.mocked(useQuery);

  beforeEach(() => {
    jest.resetAllMocks();

    jest.mocked(useParams).mockReturnValue({
      instanceOwnerPartyId: 'instanceOwnerPartyId',
      instanceGuid: 'instanceGuid',
      taskId: 'taskId',
    });
    jest.mocked(useNodeItem).mockReturnValue('summary_title' as unknown as ReturnType<typeof useNodeItem>);
    jest.mocked(Lang).mockImplementation(({ id }: { id: string }) => id);
  });

  it('should render loading state', () => {
    mockedUseQuery.mockReturnValue({
      date: undefined,
      isLoading: true,
      error: null,
    } as unknown as UseQueryResult);

    // Test case
    render(<SigneeListSummary componentNode={{} as LayoutNode<'SigneeList'>} />);

    // Assertion
    expect(mockedUseQuery).toHaveBeenCalledTimes(1);
    screen.getByText('signee_list_summary.loading');
  });

  it('should render error state', () => {
    mockedUseQuery.mockReturnValue({
      date: undefined,
      isLoading: false,
      error: new Error('error'),
    } as unknown as UseQueryResult);

    // Test case
    render(<SigneeListSummary componentNode={{} as LayoutNode<'SigneeList'>} />);

    // Assertion
    expect(mockedUseQuery).toHaveBeenCalledTimes(1);
    screen.getByText('signee_list_summary.error');
  });

  it('should render no signatures state when loading is false, error is null and data is undefined', () => {
    mockedUseQuery.mockReturnValue({
      date: undefined,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult);

    // Test case
    render(<SigneeListSummary componentNode={{} as LayoutNode<'SigneeList'>} />);

    // Assertion
    expect(mockedUseQuery).toHaveBeenCalledTimes(1);
    screen.getByText('signee_list_summary.no_signatures');
  });

  it('should render no signatures state when loading is false, error is null and data is an empty array', () => {
    mockedUseQuery.mockReturnValue({
      date: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult);

    // Test case
    render(<SigneeListSummary componentNode={{} as LayoutNode<'SigneeList'>} />);

    // Assertion
    expect(mockedUseQuery).toHaveBeenCalledTimes(1);
    screen.getByText('signee_list_summary.no_signatures');
  });

  it('should render signatures for only signed signee', () => {
    const signedTime1 = new Date().toISOString();
    const signedTime2 = new Date().toISOString();

    mockedUseQuery.mockReturnValue({
      data: [
        {
          name: 'Signee 1',
          organisation: null,
          partyId: 1,
          delegationSuccessful: true,
          notificationStatus: NotificationStatus.NotSent,
          signedTime: signedTime1,
          hasSigned: true,
        },
        {
          name: 'Signee 2',
          organisation: "Signee 2's organisation",
          partyId: 2,
          delegationSuccessful: true,
          notificationStatus: NotificationStatus.Sent,
          signedTime: signedTime2,
          hasSigned: true,
        },
        {
          name: 'Signee 3',
          organisation: "Signee 3's organisation",
          partyId: 3,
          delegationSuccessful: true,
          notificationStatus: NotificationStatus.Failed,
          signedTime: null,
          hasSigned: false,
        },
      ] satisfies SigneeState[],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult);

    // Test case
    render(<SigneeListSummary componentNode={{} as LayoutNode<'SigneeList'>} />);

    // Assertion
    expect(mockedUseQuery).toHaveBeenCalledTimes(1);
    screen.getByText('summary_title');
    screen.getByText('Signee 1');
    screen.getByText("Signee 2, signee_list_summary.on_behalf_of Signee 2's organisation");
    expect(screen.queryByText(/Signee 3/i)).not.toBeInTheDocument();
  });
});
