import { randomUUID } from 'crypto';
import { ZodError } from 'zod';

import { fetchSigneeList, NotificationStatus, SigneeState } from 'src/layout/SigneeList/api';
import { httpGet } from 'src/utils/network/sharedNetworking';

jest.mock('src/utils/network/sharedNetworking');

const mockedGet = jest.mocked(httpGet);

describe('fetchSigneeList', () => {
  const partyId = '40003';
  const instanceGuid = randomUUID();

  it('should successfully fetch signee list', async () => {
    const signedTime = new Date().toISOString();
    mockedGet.mockResolvedValue({
      signeeStates: [
        {
          name: '',
          organisation: 'ACME',
          signedTime,
          hasSigned: true,
          delegationSuccessful: true,
          notificationStatus: NotificationStatus.Failed,
          partyId: 123,
        },
        {
          name: 'Jane Doe',
          organisation: 'ACME',
          signedTime: null,
          hasSigned: false,
          delegationSuccessful: false,
          notificationStatus: NotificationStatus.Failed,
          partyId: 123,
        },
      ] satisfies SigneeState[],
    });

    const result = await fetchSigneeList(partyId, instanceGuid);

    expect(result).toEqual([
      {
        name: null,
        organisation: 'ACME',
        signedTime,
        hasSigned: true,
        delegationSuccessful: true,
        notificationStatus: NotificationStatus.Failed,
        partyId: 123,
      },
      {
        name: 'Jane Doe',
        organisation: 'ACME',
        signedTime: null,
        hasSigned: false,
        delegationSuccessful: false,
        notificationStatus: NotificationStatus.Failed,
        partyId: 123,
      },
    ] satisfies SigneeState[]);
  });

  it('should throw error if response is invalid', async () => {
    mockedGet.mockResolvedValue({
      signeeStates: [
        {
          name: '',
          organisation: 'ACME',
        },
      ],
    });

    expect.assertions(1);
    return fetchSigneeList(partyId, instanceGuid).catch((error) => expect(error).toBeInstanceOf(ZodError));
  });

  it('should throw error if name and organisation is missing/empty', async () => {
    mockedGet.mockResolvedValue({
      signeeStates: [
        {
          name: '',
          organisation: '',
          hasSigned: true,
          delegationSuccessful: true,
          notificationStatus: NotificationStatus.Failed,
          partyId: 123,
          signedTime: new Date().toISOString(),
        },
      ] satisfies SigneeState[],
    });

    expect.assertions(1);
    return fetchSigneeList(partyId, instanceGuid).catch((error) => expect(error).toBeInstanceOf(ZodError));
  });

  it('should throw if httpGet fails', async () => {
    mockedGet.mockRejectedValue(new Error('Network error'));

    expect.assertions(1);
    return fetchSigneeList(partyId, instanceGuid).catch((error) => expect(error).toBeInstanceOf(Error));
  });

  it('should sort signee list by name', async () => {
    const signedTime = new Date().toISOString();

    mockedGet.mockResolvedValue({
      signeeStates: [
        {
          name: 'Sylvester Stallone',
          organisation: 'ACME',
          signedTime,
          hasSigned: true,
          delegationSuccessful: true,
          notificationStatus: NotificationStatus.Sent,
          partyId: 123,
        },
        {
          name: 'Mary Jane',
          organisation: 'ACME',
          signedTime: null,
          hasSigned: false,
          delegationSuccessful: false,
          notificationStatus: NotificationStatus.NotSent,
          partyId: 123,
        },
      ] satisfies SigneeState[],
    });

    const result = await fetchSigneeList(partyId, instanceGuid);
    expect(result).toEqual([
      {
        name: 'Mary Jane',
        organisation: 'ACME',
        signedTime: null,
        hasSigned: false,
        delegationSuccessful: false,
        notificationStatus: NotificationStatus.NotSent,
        partyId: 123,
      },
      {
        name: 'Sylvester Stallone',
        organisation: 'ACME',
        signedTime,
        hasSigned: true,
        delegationSuccessful: true,
        notificationStatus: NotificationStatus.Sent,
        partyId: 123,
      },
    ] satisfies SigneeState[]);
  });
});
