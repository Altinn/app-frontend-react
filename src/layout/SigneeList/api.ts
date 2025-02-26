import { queryOptions, skipToken } from '@tanstack/react-query';
import { z } from 'zod';

import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath } from 'src/utils/urls/appUrlHelper';

export enum NotificationStatus {
  NotSent = 'NotSent',
  Sent = 'Sent',
  Failed = 'Failed',
}

const signeeStateSchema = z
  .object({
    name: z.string().nullish(),
    organisation: z.string().nullish(),
    hasSigned: z.boolean(),
    delegationSuccessful: z.boolean(),
    notificationStatus: z.nativeEnum(NotificationStatus),
    partyId: z.number(),
  })
  .refine(({ name, organisation }) => name || organisation, 'Either name or organisation must be present.');

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

  return parsed.signeeStates.toSorted((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}
