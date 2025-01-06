import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath } from 'src/utils/urls/appUrlHelper';

const signeeStateSchema = z
  .object({
    name: z.string().nullish(),
    organisation: z.string().nullish(),
    hasSigned: z.boolean(),
    delegationSuccessful: z.boolean(),
    notificationSuccessful: z.boolean(),
  })
  .refine(({ name, organisation }) => name || organisation, 'Either name or organisation must be present.');

export type SigneeState = z.infer<typeof signeeStateSchema>;

export const signeeListQuery = (partyId: string, instanceGuid: string) =>
  queryOptions({
    queryKey: ['signeeList', partyId, instanceGuid],
    queryFn: () => fetchSigneeList(partyId, instanceGuid),
  });

export async function fetchSigneeList(partyId: string, instanceGuid: string): Promise<SigneeState[]> {
  const url = `${appPath}/instances/${partyId}/${instanceGuid}/signing`;

  const response = await httpGet(url);
  const parsed = z.object({ signeeStates: z.array(signeeStateSchema) }).parse(response);

  return parsed.signeeStates.toSorted((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}
