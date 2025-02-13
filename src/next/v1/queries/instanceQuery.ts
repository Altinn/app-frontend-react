import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath, instancesControllerUrl } from 'src/utils/urls/appUrlHelper';
import type { InstanceDTO } from 'src/next/types/InstanceDTO';

export const fetchInstanceData = async (partyId: string, instanceGuid: string): Promise<InstanceDTO> =>
  await httpGet<InstanceDTO>(`${instancesControllerUrl}/${partyId}/${instanceGuid}`);

export const useInstanceQuery = (partyId: string, instanceGuid: string): UseQueryResult<InstanceDTO, Error> =>
  useQuery<InstanceDTO, Error>({
    queryKey: ['fetchInstanceData', partyId, instanceGuid],
    queryFn: () => fetchInstanceData(partyId, instanceGuid),
  });

export const fetchInstancesData = async (partyId: string): Promise<InstanceDTO[]> =>
  await httpGet<InstanceDTO[]>(`${appPath}/instances/${partyId}/active`);

export const useActiveInstancesQuery = (partyId: string): UseQueryResult<InstanceDTO[], Error> =>
  useQuery<InstanceDTO[], Error>({
    queryKey: ['fetchInstanceData', partyId],
    queryFn: () => fetchInstancesData(partyId),
  });
