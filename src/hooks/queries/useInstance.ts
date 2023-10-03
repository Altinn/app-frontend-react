import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppMutations, useAppQueries } from 'src/contexts/appQueriesContext';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { DeprecatedActions } from 'src/redux/deprecatedSlice';
import { maybeAuthenticationRedirect } from 'src/utils/maybeAuthenticationRedirect';
import type { IInstance } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export interface Prefill {
  [key: string]: any;
}

export interface InstanceOwner {
  partyId: string | undefined;
}

export interface Instantiation {
  instanceOwner: InstanceOwner;
  prefill: Prefill;
}

// TODO: Remove this when no sagas, etc, are using it
export const tmpSagaInstanceData: { current: IInstance | null } = { current: null };

function useGetInstanceDataQuery(enabled = false) {
  const dispatch = useAppDispatch();
  const instanceIdFromUrl = useInstanceIdParams()?.instanceId;
  window.instanceId = instanceIdFromUrl;

  const { fetchInstanceData } = useAppQueries();
  return useQuery({
    queryKey: ['fetchInstanceData', instanceIdFromUrl],
    queryFn: () => fetchInstanceData(`${instanceIdFromUrl}`),
    enabled: enabled && !!instanceIdFromUrl,
    onSuccess: () => {
      dispatch(DeprecatedActions.instanceDataFetchFulfilled());
    },
    onError: async (error: HttpClientError) => {
      await maybeAuthenticationRedirect(error);
      window.logError('Fetching instance data failed:\n', error);
    },
  });
}

function useInstantiateMutation() {
  const { doInstantiate } = useAppMutations();

  return useMutation({
    mutationFn: (instanceOwnerPartyId: string) => doInstantiate.call(instanceOwnerPartyId),
    onSuccess: (data: IInstance) => {
      doInstantiate.setLastResult(data);
    },
    onError: (error: HttpClientError) => {
      window.logError('Instantiation failed:\n', error);
    },
  });
}

function useInstantiateWithPrefillMutation() {
  const { doInstantiateWithPrefill } = useAppMutations();

  return useMutation({
    mutationFn: (instantiation: Instantiation) => doInstantiateWithPrefill.call(instantiation),
    onSuccess: (data: IInstance) => {
      doInstantiateWithPrefill.setLastResult(data);
    },
    onError: (error: HttpClientError) => {
      window.logError('Instantiation with prefill failed:\n', error);
    },
  });
}

export function useInstance() {
  const idFromUrl = useInstanceIdParams()?.instanceId;
  const instantiate = useInstantiateMutation();
  const instantiateWithPrefill = useInstantiateWithPrefillMutation();
  const fetchEnabled = !instantiate.data && !instantiateWithPrefill.data && !!idFromUrl;
  const instanceData = useGetInstanceDataQuery(fetchEnabled);
  const data = instantiate.data ?? instantiateWithPrefill.data ?? instanceData.data;
  const navigate = useNavigate();

  const [error, setError] = useState<AxiosError | undefined>(undefined);

  useEffect(() => {
    instanceData.error && setError(instanceData.error);
    instantiate.error && setError(instantiate.error);
    instantiateWithPrefill.error && setError(instantiateWithPrefill.error);

    if (instanceData.error || instantiate.error || instantiateWithPrefill.error) {
      tmpSagaInstanceData.current = null;
    }
  }, [instanceData.error, instantiate.error, instantiateWithPrefill.error]);

  useEffect(() => {
    if (data) {
      tmpSagaInstanceData.current = data;
    }
  }, [data]);

  useEffect(() => {
    if (!idFromUrl && instantiate.data?.id) {
      navigate(`instance/${instantiate.data.id}`);
    }
    if (!idFromUrl && instantiateWithPrefill.data?.id) {
      navigate(`instance/${instantiateWithPrefill.data.id}`);
    }
  }, [instantiate.data.id, instantiateWithPrefill.data.id, idFromUrl, navigate]);

  return {
    data,
    instanceId: idFromUrl,
    clearErrors: () => setError(undefined),

    // Query states
    isLoading: instanceData.isLoading || instantiate.isLoading || instantiateWithPrefill.isLoading,
    isFetching: instanceData.isFetching || instantiate.isLoading || instantiateWithPrefill.isLoading,
    isError: !!error,
    error,

    // Mutations
    instantiate: instantiate.mutate,
    instantiateWithPrefill: instantiateWithPrefill.mutate,

    // Raw inner tools
    instanceDataQuery: instanceData,
    instantiateMutation: instantiate,
    instantiateWithPrefillMutation: instantiateWithPrefill,
  };
}
