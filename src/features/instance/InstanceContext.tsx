import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { FormProvider } from 'src/features/form/FormContext';
import { useProcessEnhancement } from 'src/features/instance/useProcess';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { useInstantiation } from 'src/features/instantiate/InstantiationContext';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { LegacyProcessTriggersProvider } from 'src/hooks/useLegacyProcessTriggers';
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

function useGetInstanceDataQuery(
  enabled: boolean,
  partyId: string | undefined,
  instanceGuid: string | undefined,
  taskId: string | undefined,
) {
  const { fetchInstanceData } = useAppQueries();
  return useQuery({
    queryKey: ['fetchInstanceData', partyId, instanceGuid, taskId],
    queryFn: () => fetchInstanceData(partyId!, instanceGuid!),
    enabled: enabled && typeof partyId === 'string' && typeof instanceGuid === 'string',
    onError: async (error: HttpClientError) => {
      await maybeAuthenticationRedirect(error);
      window.logError('Fetching instance data failed:\n', error);
    },
  });
}

function useSetGlobalState(
  potentialNewData: IInstance | undefined,
  setData: (data: IInstance | undefined) => void,
  dispatch: ReturnType<typeof useAppDispatch>,
) {
  useEffect(() => {
    if (potentialNewData) {
      setData(potentialNewData);
      tmpSagaInstanceData.current = potentialNewData;
      dispatch(DeprecatedActions.instanceDataFetchFulfilled());
    }
  }, [potentialNewData, setData, dispatch]);
}

export const InstanceProvider = ({ children }: { children: React.ReactNode }) => {
  const { partyId, instanceGuid } = useParams();
  const [busyWithId, setBusyWithId] = useState<string | undefined>(undefined);
  const [processNavigationError, setProcessNavigationError] = useState<AxiosError | undefined>(undefined);
  const dispatch = useAppDispatch();

  const [data, setData] = useState<IInstance | undefined>(undefined);
  const [error, setError] = useState<AxiosError | undefined>(undefined);

  const instantiation = useInstantiation();

  // We should always fetch the instance data again when moving between process steps. There are data elements that
  // most likely will be added when this happens (when autoCreate = true), and we need to fetch them to know which
  // UUIDs we need to fetch data model data from, etc.
  const currentTaskId = data?.process?.currentTask?.elementId;
  const fetchEnabled = instantiation.lastResult
    ? instantiation.lastResult.process?.currentTask?.elementId !== currentTaskId
    : true;
  const fetchQuery = useGetInstanceDataQuery(fetchEnabled, partyId, instanceGuid, currentTaskId);

  // Update data
  useSetGlobalState(fetchQuery.data, setData, dispatch);
  useSetGlobalState(instantiation.lastResult, setData, dispatch);

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

  if (!partyId || !instanceGuid) {
    throw new Error('Tried providing instance without partyId or instanceGuid');
  }

  // TODO: Remove this when no longer needed in sagas
  const instanceId = `${partyId}/${instanceGuid}`;
  window.instanceId = instanceId;

  if (error) {
    return <UnknownError />;
  }

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
      <LegacyProcessTriggersProvider>
        <FormProvider>{children}</FormProvider>
      </LegacyProcessTriggersProvider>
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
