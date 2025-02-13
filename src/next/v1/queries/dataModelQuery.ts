// import {appPath} from "src/utils/urls/appUrlHelper";
//
// `${appPath}/instances/${instanceId}/data/${dataGuid}?includeRowId=${includeRowIds.toString()}`

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath } from 'src/utils/urls/appUrlHelper';
import type { InstanceDTO } from 'src/next/types/InstanceDTO';
//
// export const fetchDataModel = async (partyId: string, instanceGuid: string): Promise<InstanceDTO> =>
//   await httpGet<InstanceDTO>(`${instancesControllerUrl}/${partyId}/${instanceGuid}`);

// export const useInstanceQuery = (partyId: string, instanceGuid: string): UseQueryResult<InstanceDTO, Error> =>
//   useQuery<InstanceDTO, Error>({
//     queryKey: ['fetchInstanceData', partyId, instanceGuid],
//     queryFn: () => fetchDataModel(partyId, instanceGuid),
//   });

export const fetchDataModel = async (instanceId: string, dataGuid: string): Promise<InstanceDTO[]> =>
  await httpGet<InstanceDTO[]>(`${appPath}/instances/${instanceId}/data/${dataGuid}?includeRowId=${true}`);

export const useDatamodelQuery = (instanceId: string, dataGuid: string): UseQueryResult<InstanceDTO[], Error> =>
  useQuery<InstanceDTO[], Error>({
    queryKey: ['fetchDataModel', instanceId],
    queryFn: () => fetchDataModel(instanceId, dataGuid),
  });
