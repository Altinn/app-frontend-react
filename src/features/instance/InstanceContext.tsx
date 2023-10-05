import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { useProcessEnhancement } from 'src/features/instance/useProcess';
import { useInstantiation } from 'src/features/instantiate/InstantiationContext';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { DeprecatedActions } from 'src/redux/deprecatedSlice';
import { createLaxContext } from 'src/utils/createContext';
import { maybeAuthenticationRedirect } from 'src/utils/maybeAuthenticationRedirect';
import type { IInstance } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export interface InstanceContext {
  // Instance identifiers
  partyId: string;
  instanceGuid: string;
  instanceId: string;

  // Data
  data: IInstance | undefined;

  // Fetching/query states
  isLoading: boolean;
  isFetching: boolean;
  error: AxiosError | undefined;

  // Methods/utilities
  clearErrors: () => void;
  changeData: ChangeInstanceData;
}

export type ChangeInstanceData = (callback: (instance: IInstance | undefined) => IInstance | undefined) => void;

const { Provider, useCtx } = createLaxContext<InstanceContext>();

// TODO: Remove this when no sagas, etc, are using it
export const tmpSagaInstanceData: { current: IInstance | null } = { current: null };

function useGetInstanceDataQuery(enabled = false, partyId: string | undefined, instanceGuid: string | undefined) {
  const dispatch = useAppDispatch();

  const { fetchInstanceData } = useAppQueries();
  return useQuery({
    queryKey: ['fetchInstanceData', partyId, instanceGuid],
    queryFn: () => fetchInstanceData(`${partyId}`, `${instanceGuid}`),
    enabled: enabled && !!partyId && !!instanceGuid,
    onSuccess: () => {
      dispatch(DeprecatedActions.instanceDataFetchFulfilled());
    },
    onError: async (error: HttpClientError) => {
      await maybeAuthenticationRedirect(error);
      window.logError('Fetching instance data failed:\n', error);
    },
  });
}

function useSetGlobalState(potentialNewData: IInstance | undefined, setData: (data: IInstance | undefined) => void) {
  useEffect(() => {
    if (potentialNewData) {
      setData(potentialNewData);
      tmpSagaInstanceData.current = potentialNewData;
    }
  }, [potentialNewData, setData]);
}

function useInstanceContext(partyId?: string, instanceGuid?: string) {
  const instantiation = useInstantiation();
  const fetchEnabled = !(instantiation.isLoading || instantiation.lastResult);
  const instanceData = useGetInstanceDataQuery(fetchEnabled, partyId, instanceGuid);

  const [data, setData] = useState<IInstance | undefined>(undefined);
  const [error, setError] = useState<AxiosError | undefined>(undefined);

  // Update data
  useSetGlobalState(instanceData.data, setData);
  useSetGlobalState(instantiation.lastResult, setData);

  // Update error states
  useEffect(() => {
    instanceData.error && setError(instanceData.error);
    instantiation.error && setError(instantiation.error);

    if (instanceData.error) {
      tmpSagaInstanceData.current = null;
    }
  }, [instanceData.error, instantiation.error]);

  const clearErrors = useCallback(() => {
    setError(undefined);
  }, []);

  const changeData: ChangeInstanceData = useCallback((callback) => {
    setData((prev) => {
      const next = callback(prev);
      if (next) {
        tmpSagaInstanceData.current = next;
        return next;
      }
      return prev;
    });
  }, []);

  useProcessEnhancement(data, changeData);

  return {
    data,
    clearErrors,
    changeData,

    // Query states
    isLoading: instanceData.isLoading,
    isFetching: instanceData.isFetching,
    isError: !!error,
    error,
  };
}

export const InstanceProvider = ({ children }: { children: React.ReactNode }) => {
  const { partyId, instanceGuid } = useParams();
  const instance = useInstanceContext(partyId, instanceGuid);

  if (!partyId || !instanceGuid) {
    throw new Error('Tried providing instance without partyId or instanceGuid');
  }

  // TODO: Remove this when no longer needed in sagas
  const instanceId = `${partyId}/${instanceGuid}`;
  window.instanceId = instanceId;

  return (
    <Provider
      value={{
        data: instance.data,
        isLoading: instance.isLoading,
        isFetching: instance.isFetching,
        error: instance.error,
        clearErrors: instance.clearErrors,
        changeData: instance.changeData,
        partyId,
        instanceGuid,
        instanceId,
      }}
    >
      {children}
    </Provider>
  );
};

export const useLaxInstance = () => useCtx();
export const useLaxInstanceData = () => useLaxInstance()?.data;

export const useStrictInstance = () => {
  const instance = useLaxInstance();
  if (!instance) {
    throw new Error('Tried using instance context outside of instance context provider');
  }

  return instance;
};

export const useStrictInstanceData = () => {
  const data = useStrictInstance().data;
  if (!data) {
    throw new Error('Tried using instance data outside of instance context provider, or before data was loaded');
  }

  return data;
};
