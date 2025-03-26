import { z } from 'zod';

import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath } from 'src/utils/urls/appUrlHelper';

const authorizedOrganisationDetailsSchema = z.object({
  organisations: z.array(
    z.object({
      orgNumber: z.string(),
      orgName: z.string(),
      partyId: z.number(),
    }),
  ),
});

export type AuthorizedOrganisationDetails = z.infer<typeof authorizedOrganisationDetailsSchema>;

export const authorizedOrganisationDetailsQuery = (partyId: string, instanceGuid: string) => ({
  queryKey: ['authorizedOrganisationDetails', partyId, instanceGuid],
  queryFn: () => fetchAuthorizedOrganisationDetails(partyId, instanceGuid),
  refetchInterval: 1000 * 60, // 1 minute
});

export async function fetchAuthorizedOrganisationDetails(
  partyId: string,
  instanceGuid: string,
): Promise<AuthorizedOrganisationDetails> {
  const url = `${appPath}/instances/${partyId}/${instanceGuid}/signing/organisations`;
  const response = await httpGet(url);
  return authorizedOrganisationDetailsSchema.parse(response);

  // //simulate isloading
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve([
  //       {
  //         orgNumber: '123456789',
  //         orgName: 'Company A',
  //         partyId: 1,
  //       },
  //     ]);
  //   }, 1000);
  // });
}
