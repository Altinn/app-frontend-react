import { useNavigate } from 'react-router-dom';

import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import type { MutateOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { instanceQueries } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import type { IInstance } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export interface Prefill {
  [key: string]: unknown;
}

export interface InstanceOwner {
  partyId: string | undefined;
}

export interface Instantiation {
  instanceOwner: InstanceOwner;
  prefill: Prefill;
}

function useInstantiateMutation() {
  const { doInstantiate } = useAppMutations();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentLanguage = useCurrentLanguage();

  return useMutation({
    mutationKey: ['instantiate', 'simple'],
    mutationFn: (instanceOwnerPartyId: number) => doInstantiate(instanceOwnerPartyId, currentLanguage),
    onError: (error: HttpClientError) => {
      window.logError('Instantiation failed:\n', error);
    },
    onSuccess: async (data) => {
      const [instanceOwnerPartyId, instanceGuid] = data.id.split('/');
      const queryKey = instanceQueries.instanceData({
        instanceOwnerPartyId,
        instanceGuid,
      }).queryKey;
      queryClient.setQueryData(queryKey, data);

      navigate(`/instance/${data.id}`);
      await queryClient.invalidateQueries({ queryKey: ['fetchApplicationMetadata'] });
    },
  }).mutateAsync;
}

function useInstantiateWithPrefillMutation() {
  const { doInstantiateWithPrefill } = useAppMutations();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentLanguage = useCurrentLanguage();

  return useMutation({
    mutationKey: ['instantiate', 'withPrefill'],
    mutationFn: (instantiation: Instantiation) => doInstantiateWithPrefill(instantiation, currentLanguage),
    onError: (error: HttpClientError) => {
      window.logError('Instantiation with prefill failed:\n', error);
    },
    onSuccess: async (data) => {
      const [instanceOwnerPartyId, instanceGuid] = data.id.split('/');
      const queryKey = instanceQueries.instanceData({
        instanceOwnerPartyId,
        instanceGuid,
      }).queryKey;
      queryClient.setQueryData(queryKey, data);

      navigate(`/instance/${data.id}`);
      await queryClient.invalidateQueries({ queryKey: ['fetchApplicationMetadata'] });
    },
  }).mutateAsync;
}

type Options<Vars> = MutateOptions<IInstance, AxiosError, Vars, unknown> & { force?: boolean };

export const useInstantiation = () => {
  const instantiate = useInstantiateMutation();
  const instantiateWithPrefill = useInstantiateWithPrefillMutation();
  const mutations = useMutationState({ filters: { mutationKey: ['instantiate'] } });
  const hasAlreadyInstantiated = mutations.length > 0;
  const lastMutation = mutations.at(-1);

  return {
    instantiate: async (instanceOwnerPartyId: number, { force = false, ...options }: Options<number> = {}) => {
      if (!hasAlreadyInstantiated || force) {
        await instantiate(instanceOwnerPartyId, options).catch(() => {});
      }
    },
    instantiateWithPrefill: async (value: Instantiation, { force = false, ...options }: Options<Instantiation>) => {
      if (!hasAlreadyInstantiated || force) {
        await instantiateWithPrefill(value, options).catch(() => {});
      }
    },

    error: lastMutation?.error,
    lastResult: lastMutation?.data,
  };
};
