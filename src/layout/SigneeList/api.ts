import { queryOptions, skipToken } from '@tanstack/react-query';
import { z } from 'zod';

import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath } from 'src/utils/urls/appUrlHelper';

export enum NotificationStatus {
  NotSent = 'NotSent',
  Sent = 'Sent',
  Failed = 'Failed',
}

function makePascalCase(input: string) {
  return input
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const signeeStateSchema = z
  .object({
    name: z
      .string()
      .nullish()
      .transform((name) => (name ? makePascalCase(name) : null)),
    organisation: z
      .string()
      .nullish()
      .transform((organisation) => (organisation ? makePascalCase(organisation) : null)),
    signedTime: z.string().datetime().nullable(),
    delegationSuccessful: z.boolean(),
    notificationStatus: z.nativeEnum(NotificationStatus),
    partyId: z.number(),
  })
  .refine(({ name, organisation }) => name || organisation, 'Either name or organisation must be present.')
  .transform((it) => ({ ...it, hasSigned: !!it.signedTime }));

export type SigneeState = z.infer<typeof signeeStateSchema>;

export const signingQueries = {
  all: ['signing'],
  signeeList: (partyId: string | undefined, instanceGuid: string | undefined, taskId: string | undefined) =>
    queryOptions({
      queryKey: [...signingQueries.all, 'signeeList', partyId, instanceGuid, taskId],
      queryFn: partyId && instanceGuid && taskId ? () => fetchSigneeList(partyId, instanceGuid) : skipToken,
      refetchInterval: 1000 * 60, // 1 minute
      refetchOnMount: 'always',
    }),
};

export const signeeListQuery = signingQueries.signeeList;

export async function fetchSigneeList(partyId: string, instanceGuid: string): Promise<SigneeState[]> {
  const url = `${appPath}/instances/${partyId}/${instanceGuid}/signing`;

  const response = await httpGet(url);
  const parsed = z.object({ signeeStates: z.array(signeeStateSchema) }).parse(response);

  // const data = [
  //   {
  //     name: null,
  //     organisation: 'Company A',
  //     delegationSuccessful: true,
  //     notificationStatus: NotificationStatus.Sent,
  //     partyId: 1,
  //     hasSigned: false,
  //     signedTime: null,
  //   },
  //   {
  //     name: 'Johnny The Donny',
  //     organisation: 'Company B',
  //     delegationSuccessful: true,
  //     notificationStatus: NotificationStatus.NotSent,
  //     partyId: 2,
  //     hasSigned: true,
  //     signedTime: '2021-09-01T12:00:00Z',
  //   },
  //   {
  //     name: 'John Doe',
  //     organisation: null,
  //     delegationSuccessful: true,
  //     notificationStatus: NotificationStatus.Sent,
  //     partyId: 3,
  //     hasSigned: false,
  //     signedTime: null,
  //   },
  // ];

  return parsed.signeeStates.toSorted((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  // return data;
}
