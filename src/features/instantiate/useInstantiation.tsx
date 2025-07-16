import { useNavigate } from 'react-router-dom';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useSetNavigationEffect } from 'src/features/navigation/NavigationEffectContext';
import { focusMainContent } from 'src/hooks/useNavigatePage';
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

function useInstantiateMutation(isUserInitiated: boolean) {
  const { doInstantiate } = useAppMutations();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentLanguage = useCurrentLanguage();
  const setNavigationEffect = useSetNavigationEffect();

  return useMutation({
    mutationKey: ['instantiate', 'simple'],
    mutationFn: (instanceOwnerPartyId: number) => doInstantiate(instanceOwnerPartyId, currentLanguage),
    onError: (error: HttpClientError) => {
      window.logError('Instantiation failed:\n', error);
    },
    onSuccess: async (data) => {
      const targetLocation = `/instance/${data.id}`;
      if (isUserInitiated) {
        setNavigationEffect({ targetLocation, matchStart: true, callback: focusMainContent });
      }
      navigate(targetLocation);
      await queryClient.invalidateQueries({ queryKey: ['fetchApplicationMetadata'] });
    },
  });
}

function useInstantiateWithPrefillMutation(isUserInitiated: boolean) {
  const { doInstantiateWithPrefill } = useAppMutations();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentLanguage = useCurrentLanguage();
  const setNavigationEffect = useSetNavigationEffect();

  return useMutation({
    mutationKey: ['instantiate', 'withPrefill'],
    mutationFn: (instantiation: Instantiation) => doInstantiateWithPrefill(instantiation, currentLanguage),
    onError: (error: HttpClientError) => {
      window.logError('Instantiation with prefill failed:\n', error);
    },
    onSuccess: async (data) => {
      const targetLocation = `/instance/${data.id}`;
      if (isUserInitiated) {
        setNavigationEffect({ targetLocation, matchStart: true, callback: focusMainContent });
      }
      navigate(targetLocation);
      await queryClient.invalidateQueries({ queryKey: ['fetchApplicationMetadata'] });
    },
  });
}

export const useInstantiation = (isUserInitiated: boolean) => {
  const queryClient = useQueryClient();
  const instantiate = useInstantiateMutation(isUserInitiated);
  const instantiateWithPrefill = useInstantiateWithPrefillMutation(isUserInitiated);

  const hasAlreadyInstantiated = queryClient.getMutationCache().findAll({ mutationKey: ['instantiate'] }).length > 0;

  return {
    instantiate: async (instanceOwnerPartyId: number, force: boolean = false) => {
      if (!hasAlreadyInstantiated || force) {
        await instantiate.mutateAsync(instanceOwnerPartyId).catch(() => {});
      }
    },
    instantiateWithPrefill: async (value: Instantiation, force: boolean = false) => {
      if (!hasAlreadyInstantiated || force) {
        await instantiateWithPrefill.mutateAsync(value).catch(() => {});
      }
    },

    error: instantiate.error || instantiateWithPrefill.error,
    lastResult: instantiate.data ?? instantiateWithPrefill.data,
  };
};
