import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { FormDataProvider } from 'src/features/formData/FormDataContext';
import { useProcessEnhancement, useRealTaskTypeById } from 'src/features/instance/useProcess';
import { useInstantiation } from 'src/features/instantiate/InstantiationContext';
import { IsLoadingActions } from 'src/features/isLoading/isLoadingSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { DeprecatedActions } from 'src/redux/deprecatedSlice';
import { ProcessTaskType } from 'src/types';
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
  changeData: ChangeInstanceData;

  // Process navigation state
  processNavigation: {
    busy: boolean;
    busyWithId: string | undefined;
    setBusyWithId: (id: string | undefined) => void;
    error: AxiosError | undefined;
    setError: (error: AxiosError | undefined) => void;
  };
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

export const InstanceProvider = ({ children }: { children: React.ReactNode }) => {
  const { partyId, instanceGuid } = useParams();
  const [busyWithId, setBusyWithId] = useState<string | undefined>(undefined);
  const [processNavigationError, setProcessNavigationError] = useState<AxiosError | undefined>(undefined);
  const dispatch = useAppDispatch();

  const instantiation = useInstantiation();
  const fetchEnabled = !(instantiation.isLoading || instantiation.lastResult);
  const fetchQuery = useGetInstanceDataQuery(fetchEnabled, partyId, instanceGuid);

  const [data, setData] = useState<IInstance | undefined>(undefined);
  const [error, setError] = useState<AxiosError | undefined>(undefined);

  // Update data
  useSetGlobalState(fetchQuery.data, setData);
  useSetGlobalState(instantiation.lastResult, setData);

  // Update error states
  useEffect(() => {
    fetchQuery.error && setError(fetchQuery.error);
    instantiation.error && setError(instantiation.error);

    if (fetchQuery.error) {
      tmpSagaInstanceData.current = null;
    }
  }, [fetchQuery.error, instantiation.error]);

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

  const taskId = data?.process?.currentTask?.elementId;
  const realTaskType = useRealTaskTypeById(taskId);
  useEffect(() => {
    if (realTaskType === ProcessTaskType.Data) {
      dispatch(IsLoadingActions.startDataTaskIsLoading());
    }
  }, [dispatch, realTaskType]);

  if (!partyId || !instanceGuid) {
    throw new Error('Tried providing instance without partyId or instanceGuid');
  }

  // TODO: Remove this when no longer needed in sagas
  const instanceId = `${partyId}/${instanceGuid}`;
  window.instanceId = instanceId;

  return (
    <Provider
      value={{
        data,
        isLoading: data ? false : fetchQuery.isLoading,
        isFetching: fetchQuery.isFetching,
        error,
        changeData,
        partyId,
        instanceGuid,
        instanceId,
        processNavigation: {
          busy: !!busyWithId,
          busyWithId,
          setBusyWithId,
          error: processNavigationError,
          setError: setProcessNavigationError,
        },
      }}
    >
      <FormDataProvider>{children}</FormDataProvider>
    </Provider>
  );
};

/**
 * There are strict and lax (relaxed) versions of both of these. The lax versions will return undefined if the context
 * is not available, while the strict versions will throw an error. Always prefer the strict versions in code you
 * know should only be used in instanceful contexts. Code paths that have to work in stateless/instanceless contexts
 * should use the lax versions and handle the undefined case.
 */

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
    throw new Error('Tried using instance data before data was loaded');
  }

  return data;
};
