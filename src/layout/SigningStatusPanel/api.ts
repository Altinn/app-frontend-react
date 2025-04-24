import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath } from 'src/utils/urls/appUrlHelper';

const authorizedOrganizationDetailsSchema = z.object({
  organisations: z.array(
    z.object({
      orgNumber: z.string(),
      orgName: z.string(),
      partyId: z.number(),
    }),
  ),
});

export type AuthorizedOrganizationDetails = z.infer<typeof authorizedOrganizationDetailsSchema>;

const authorizedOrganizationDetailsQuery = (partyId: string, instanceGuid: string) => ({
  queryKey: ['authorizedOrganizationDetails', partyId, instanceGuid],
  queryFn: async () => {
    const url = `${appPath}/instances/${partyId}/${instanceGuid}/signing/organisations`;
    const response = await httpGet(url);
    return authorizedOrganizationDetailsSchema.parse(response);
  },
});

export function useAuthorizedOrganizationDetails(partyId: string | undefined, instanceGuid: string | undefined) {
  return useQuery(authorizedOrganizationDetailsQuery(partyId!, instanceGuid!));
}
