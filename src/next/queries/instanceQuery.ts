import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { httpGet } from 'src/utils/network/sharedNetworking';
import { instancesControllerUrl } from 'src/utils/urls/appUrlHelper';
import type { IInstance } from 'src/types/shared';

export const fetchInstanceData = async (partyId: string, instanceGuid: string): Promise<IInstance> =>
  await httpGet<IInstance>(`${instancesControllerUrl}/${partyId}/${instanceGuid}`);

export const useInstanceQuery = (partyId: string, instanceGuid: string): UseQueryResult<IInstance, Error> =>
  useQuery<IInstance, Error>({
    queryKey: ['fetchInstanceData', partyId, instanceGuid],
    queryFn: () => fetchInstanceData(partyId, instanceGuid),
  });
