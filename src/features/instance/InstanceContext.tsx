import React, { useEffect } from 'react';
import { useNavigation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { queryOptions, skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import deepEqual from 'fast-deep-equal';

import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { useHasPendingScans } from 'src/features/attachments/useHasPendingScans';
import { cleanUpInstanceData } from 'src/features/instance/instanceUtils';
import { useProcessQuery } from 'src/features/instance/useProcessQuery';
import { useInstantiation } from 'src/features/instantiate/useInstantiation';
import { useInstanceOwnerParty } from 'src/features/party/PartiesProvider';
import { useNavigationParam } from 'src/hooks/navigation';
import { fetchInstanceData } from 'src/queries/queries';
import { buildInstanceDataSources } from 'src/utils/instanceDataSources';
import type { IData, IInstance, IInstanceDataSources } from 'src/types/shared';

export const useLaxInstanceId = () => {
  const instanceOwnerPartyId = useNavigationParam('instanceOwnerPartyId');
  const instanceGuid = useNavigationParam('instanceGuid');
  return instanceOwnerPartyId && instanceGuid ? `${instanceOwnerPartyId}/${instanceGuid}` : undefined;
};

export const useStrictInstanceId = () => {
  const instanceId = useLaxInstanceId();
  if (!instanceId) {
    throw new Error('Missing instanceOwnerPartyId or instanceGuid in URL');
  }

  return instanceId;
};

export type ChangeInstanceData = (callback: (instance: IInstance | undefined) => IInstance | undefined) => void;

export function useInstanceDataQueryArgs() {
  const hasResultFromInstantiation = !!useInstantiation().lastResult;
  const instanceOwnerPartyId = useNavigationParam('instanceOwnerPartyId');
  const instanceGuid = useNavigationParam('instanceGuid');

  return { hasResultFromInstantiation, instanceOwnerPartyId, instanceGuid };
}

export const instanceQueries = {
  all: () => ['instanceData'] as const,
  instanceData: ({
    hasResultFromInstantiation,
    instanceOwnerPartyId,
    instanceGuid,
  }: {
    hasResultFromInstantiation: boolean;
    instanceOwnerPartyId: string | undefined;
    instanceGuid: string | undefined;
  }) =>
    queryOptions({
      queryKey: [...instanceQueries.all(), { instanceOwnerPartyId, instanceGuid }] as const,
      queryFn:
        instanceOwnerPartyId && instanceGuid ? () => fetchInstanceData(instanceOwnerPartyId, instanceGuid) : skipToken,
      enabled: !!instanceOwnerPartyId && !!instanceGuid && !hasResultFromInstantiation,
    }),
};

export function useGetInstanceDataQuery<R = IInstance>({
  enablePolling = false,
  enabled = true,
  select,
}: {
  enablePolling?: boolean;
  enabled?: boolean;
  select?: ((data: IInstance) => R) | undefined;
} = {}) {
  const query = useQuery({
    ...instanceQueries.instanceData(useInstanceDataQueryArgs()),
    refetchInterval: enablePolling ? 5000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: enablePolling,
    retry: 3,
    enabled,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select,
  });

  useEffect(() => {
    query.error && window.logError('Fetching instance data failed:\n', query.error);
  }, [query.error]);

  return query;
}

const emptyArray: never[] = [];

export const useLaxInstanceData = <U,>(selector: (data: IInstance) => U) =>
  useGetInstanceDataQuery({ select: selector }).data;

export function useCurrentInstanceQueryKey(): readonly unknown[] | undefined {
  const { hasResultFromInstantiation, instanceOwnerPartyId, instanceGuid } = useInstanceDataQueryArgs();

  if (!instanceOwnerPartyId || !instanceGuid) {
    return undefined;
  }

  const queryKey = instanceQueries.instanceData({
    hasResultFromInstantiation,
    instanceOwnerPartyId,
    instanceGuid,
  }).queryKey;

  return queryKey;
}

export const useOptimisticallyAppendDataElements = () => {
  const queryClient = useQueryClient();
  const queryKey = useCurrentInstanceQueryKey();

  return (elements: IData[]) => {
    if (!queryKey) {
      return undefined;
    }

    queryClient.setQueryData(queryKey, (oldData: IInstance | undefined) => {
      if (!oldData) {
        throw new Error('Cannot append data element when instance data is not set');
      }
      return {
        ...oldData,
        data: [...oldData.data, ...elements],
      };
    });
  };
};

export const useOptimisticallyUpdateDataElement = () => {
  const queryClient = useQueryClient();
  const queryKey = useCurrentInstanceQueryKey();

  return (elementId: string, mutator: (element: IData) => IData) => {
    if (!queryKey) {
      return undefined;
    }
    queryClient.setQueryData(queryKey, (oldData: IInstance | undefined) => {
      if (!oldData) {
        throw new Error('Cannot mutate data element when instance data is not set');
      }
      return {
        ...oldData,
        data: oldData.data.map((element) => (element.id === elementId ? mutator(element) : element)),
      };
    });
  };
};
export const useOptimisticallyRemoveDataElement = () => {
  const queryClient = useQueryClient();
  const queryKey = useCurrentInstanceQueryKey();

  return (elementId: string) => {
    if (!queryKey) {
      return undefined;
    }
    queryClient.setQueryData(queryKey, (oldData: IInstance | undefined) => {
      if (!oldData) {
        throw new Error('Cannot remove data element when instance data is not set');
      }
      return {
        ...oldData,
        data: oldData.data.filter((element) => element.id !== elementId),
      };
    });
  };
};

export const useOptimisticallyUpdateCachedInstance = (): ChangeInstanceData | undefined => {
  const queryClient = useQueryClient();
  const queryKey = useCurrentInstanceQueryKey();

  return (callback: (instance: IInstance | undefined) => IInstance | undefined) => {
    if (!queryKey) {
      return undefined;
    }
    queryClient.setQueryData(queryKey, (oldData: IInstance | undefined) => {
      const next = callback(oldData);
      const clean = cleanUpInstanceData(next);
      if (clean && !deepEqual(oldData, clean)) {
        return next;
      }
      return oldData;
    });
  };
};

export const useHasInstance = () => {
  const instanceOwnerPartyId = useNavigationParam('instanceOwnerPartyId');
  const instanceGuid = useNavigationParam('instanceGuid');
  return !!(instanceOwnerPartyId && instanceGuid);
};

export function useLaxInstanceDataSources(): IInstanceDataSources | null {
  const instanceOwnerParty = useInstanceOwnerParty();
  return (
    useGetInstanceDataQuery({
      select: (instance) => buildInstanceDataSources(instance, instanceOwnerParty),
    }).data ?? null
  );
}

export const useLaxDataElementsSelectorProps = () => {
  const { data: dataElements } = useGetInstanceDataQuery({ select: (instance) => instance.data });

  return <U,>(selectDataElements: (data: IData[]) => U) => {
    if (!dataElements) {
      return undefined;
    }

    return selectDataElements(dataElements);
  };
};

const InstanceContext = React.createContext<IInstance | null>(null);

export const InstanceProvider = ({ children }: PropsWithChildren) => {
  const instanceOwnerPartyId = useNavigationParam('instanceOwnerPartyId');
  const instanceGuid = useNavigationParam('instanceGuid');
  const instantiation = useInstantiation();
  const enabled = !!instanceOwnerPartyId && !!instanceGuid;
  const navigation = useNavigation();

  const hasPendingScans = useHasPendingScans();
  const { isLoading: isProcessLoading, error: processError } = useProcessQuery();

  const {
    error: queryError,
    isLoading,
    data: queryData,
  } = useGetInstanceDataQuery({
    enablePolling: hasPendingScans,
    enabled,
  });

  const instantiationError = instantiation.error ?? queryError;
  const data = instantiation.lastResult ?? queryData;
  const isDataSet = data !== undefined;

  if (!window.inUnitTest && data && instanceGuid && !data.id.endsWith(instanceGuid)) {
    throw new Error(
      `Mismatch between instanceGuid in URL and fetched instance data (URL: '${instanceGuid}', data: '${data.id}')`,
    );
  }

  const error = instantiationError ?? processError;
  if (error) {
    return <DisplayError error={error} />;
  }

  if (isLoading || !isDataSet || !enabled) {
    return <Loader reason='instance' />;
  }
  if (isProcessLoading) {
    return <Loader reason='fetching-process' />;
  }

  if (navigation.state === 'loading') {
    return <Loader reason='navigation' />;
  }

  if (!instanceOwnerPartyId || !instanceGuid) {
    throw new Error('Missing instanceOwnerPartyId or instanceGuid when creating instance context');
  }
  if (!window.inUnitTest && data && !data.id.endsWith(instanceGuid)) {
    throw new Error(
      `Mismatch between instanceGuid in URL and fetched instance data (URL: '${instanceGuid}', data: '${data.id}')`,
    );
  }

  return <InstanceContext.Provider value={data}>{children}</InstanceContext.Provider>;
};

/** Beware that in later versions, this will re-render your component after every save, as
 * the backend sends us updated instance data */
export const useLaxInstanceDataElements = (dataType: string | undefined) =>
  useGetInstanceDataQuery({
    select: (instance) => instance.data.filter((dataElement) => dataElement.dataType === dataType),
  }).data ?? emptyArray;

export function useStrictDataElements(dataType: string | undefined) {
  const { data: dataElements, isError } = useGetInstanceDataQuery({
    select: (instanceData) => instanceData.data.filter((dataElement) => dataElement.dataType === dataType),
  });

  if (!dataElements) {
    return [];
  }

  if (isError) {
    throw new Error('An error occurred when fetching instance data elements.');
  }

  return dataElements;
}

export function useInvalidateInstanceData() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: instanceQueries.all() });
  };
}
