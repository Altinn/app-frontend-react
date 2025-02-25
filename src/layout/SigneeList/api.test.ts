import { randomUUID } from 'crypto';
import { ZodError } from 'zod';

import { fetchSigneeList, NotificationStatus } from 'src/layout/SigneeList/api';
import { httpGet } from 'src/utils/network/sharedNetworking';

jest.mock('src/utils/network/sharedNetworking');

const mockedGet = jest.mocked(httpGet);

describe('fetchSigneeList', () => {
  const partyId = '40003';
  const instanceGuid = randomUUID();

  it('should successfully fetch signee list', async () => {
    mockedGet.mockResolvedValue({
      signeeStates: [
        {
          name: '',
          organisation: 'ACME',
          hasSigned: true,
          delegationSuccessful: true,
          notificationSuccessful: NotificationStatus.Failed,
          partyId: 123,
        },
        {
          name: 'Jane Doe',
          organisation: 'ACME',
          hasSigned: false,
          delegationSuccessful: false,
          notificationSuccessful: NotificationStatus.Failed,
          partyId: 123,
        },
      ],
    });

    const result = await fetchSigneeList(partyId, instanceGuid);

    expect(result).toEqual([
      {
        name: '',
        organisation: 'ACME',
        hasSigned: true,
        delegationSuccessful: true,
        notificationSuccessful: NotificationStatus.Failed,
        partyId: 123,
      },
      {
        name: 'Jane Doe',
        organisation: 'ACME',
        hasSigned: false,
        delegationSuccessful: false,
        notificationSuccessful: NotificationStatus.Failed,
        partyId: 123,
      },
    ]);
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
          notificationSuccessful: NotificationStatus.Failed,
        },
      ],
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
    mockedGet.mockResolvedValue({
      signeeStates: [
        {
          name: 'Sylvester Stallone',
          organisation: 'ACME',
          hasSigned: true,
          delegationSuccessful: true,
          notificationSuccessful: NotificationStatus.Sent,
          partyId: 123,
        },
        {
          name: 'Mary Jane',
          organisation: 'ACME',
          hasSigned: false,
          delegationSuccessful: false,
          notificationSuccessful: NotificationStatus.NotSent,
          partyId: 123,
        },
      ],
    });

    const result = await fetchSigneeList(partyId, instanceGuid);
    expect(result).toEqual([
      {
        name: 'Mary Jane',
        organisation: 'ACME',
        hasSigned: false,
        delegationSuccessful: false,
        notificationSuccessful: NotificationStatus.NotSent,
        partyId: 123,
      },
      {
        name: 'Sylvester Stallone',
        organisation: 'ACME',
        hasSigned: true,
        delegationSuccessful: true,
        notificationSuccessful: NotificationStatus.Sent,
        partyId: 123,
      },
    ]);
  });
});
