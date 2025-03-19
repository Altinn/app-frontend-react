import type { PropsWithChildren } from 'react';
import React, { useEffect, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { createContext } from 'src/core/contexts/context';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { NoValidPartiesError } from 'src/features/instantiate/containers/NoValidPartiesError';
import { useProfile, useShouldFetchProfile } from 'src/features/profile/ProfileProvider';
import type { IInstance, IInstanceOwner, IParty } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export const altinnPartyIdCookieName = 'altinnPartyId';

// Also used for prefetching @see appPrefetcher.ts, partyPrefetcher.ts
export function usePartiesQueryDef(enabled: boolean) {
  const { fetchPartiesAllowedToInstantiate } = useAppQueries();
  return {
    queryKey: ['partiesAllowedToInstantiate', enabled],
    queryFn: fetchPartiesAllowedToInstantiate,
    enabled,
  };
}

const usePartiesAllowedToInstantiateQuery = () => {
  const enabled = useShouldFetchProfile();

  const utils = useQuery(usePartiesQueryDef(enabled));

  useEffect(() => {
    utils.error && window.logError('Fetching parties failed:\n', utils.error);
  }, [utils.error]);

  return {
    ...utils,
    enabled,
  };
};

// Also used for prefetching @see appPrefetcher.ts, partyPrefetcher.ts
export function altinnPartyIdCookieQuery(enabled: boolean) {
  return {
    queryKey: ['currentParty'],
    queryFn: () =>
      document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${altinnPartyIdCookieName}=`))
        ?.split('=')[1],
    enabled,
  };
}

const useCurrentPartyQuery = (enabled: boolean) => {
  const profile = useProfile();
  const parties = usePartiesAllowedToInstantiate();
  const query = useQuery(altinnPartyIdCookieQuery(enabled));
  const { data: altinnPartyIdCookieValue, error } = query;

  useEffect(() => {
    error && window.logError('Fetching current party failed:\n', error);
  }, [error]);

  // TODO: use new values from backend, but default to this
  const cookieParty = altinnPartyIdCookieValue
    ? parties?.find((party) => party.partyId.toString() === altinnPartyIdCookieValue)
    : undefined;

  // fallback to profile.party if no cookie is set
  const selectedParty = cookieParty ?? profile?.party;

  if (selectedParty) {
    document.cookie = `${altinnPartyIdCookieName}=${selectedParty.partyId};`;
  }

  return { ...query, data: selectedParty };
};

const useSetCurrentPartyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partyId: string | number | undefined) => {
      const value = partyId ?? '';
      document.cookie = `${altinnPartyIdCookieName}=${value};`;
    },
    onError: (error: HttpClientError) => {
      window.logError('Setting current party failed:\n', error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentParty'] });
    },
  });
};

const { Provider: PartiesProvider, useCtx: usePartiesAllowedToInstantiateCtx } = delayedContext(() =>
  createQueryContext<IParty[] | undefined, false>({
    name: 'Parties',
    required: false,
    default: undefined,
    query: usePartiesAllowedToInstantiateQuery,
  }),
);

interface CurrentParty {
  party: IParty | undefined;
  currentIsValid: boolean | undefined;
  userHasSelectedParty: boolean | undefined;
  setUserHasSelectedParty: (hasSelected: boolean) => void;
  setParty: (party: IParty) => Promise<void>;
}

const { Provider: RealCurrentPartyProvider, useCtx: useCurrentPartyCtx } = createContext<CurrentParty>({
  name: 'CurrentParty',
  required: false,
  default: {
    party: undefined,
    currentIsValid: undefined,
    userHasSelectedParty: undefined,
    setUserHasSelectedParty: () => {
      throw new Error('CurrentPartyProvider not initialized');
    },
    setParty: () => {
      throw new Error('CurrentPartyProvider not initialized');
    },
  },
});

const CurrentPartyProvider = ({ children }: PropsWithChildren) => {
  const validParties = useValidParties();
  const { mutateAsync, error: errorFromMutation } = useSetCurrentPartyMutation();
  const { data: currentParty, isLoading, error: errorFromQuery } = useCurrentPartyQuery(true);
  const [userHasSelectedParty, setUserHasSelectedParty] = useState(false);

  if (isLoading) {
    return <Loader reason='current-party' />;
  }

  const error = errorFromMutation || errorFromQuery;
  if (error) {
    return <DisplayError error={error} />;
  }

  if (!validParties?.length) {
    return <NoValidPartiesError />;
  }

  return (
    <RealCurrentPartyProvider
      value={{
        party: currentParty,
        currentIsValid: !!currentParty,
        userHasSelectedParty,
        setUserHasSelectedParty: (hasSelected: boolean) => setUserHasSelectedParty(hasSelected),
        setParty: (party) => mutateAsync(party.partyId),
      }}
    >
      {children}
    </RealCurrentPartyProvider>
  );
};

export function PartyProvider({ children }: PropsWithChildren) {
  const shouldFetchProfile = useShouldFetchProfile();

  if (!shouldFetchProfile) {
    return children;
  }

  return (
    <PartiesProvider>
      <CurrentPartyProvider>{children}</CurrentPartyProvider>
    </PartiesProvider>
  );
}

export const usePartiesAllowedToInstantiate = () => usePartiesAllowedToInstantiateCtx();

/**
 * Returns the current party, or the custom selected current party if one is set.
 * Please note that the current party might not be allowed to instantiate, so you should
 * check the `canInstantiate` property as well.
 */
export const useCurrentParty = () => useCurrentPartyCtx().party;
export const useCurrentPartyIsValid = () => useCurrentPartyCtx().currentIsValid;
export const useSetCurrentParty = () => useCurrentPartyCtx().setParty;

export const useValidParties = () => usePartiesAllowedToInstantiateCtx()?.filter((party) => party.isDeleted === false);

export const useHasSelectedParty = () => useCurrentPartyCtx().userHasSelectedParty;

export const useSetHasSelectedParty = () => useCurrentPartyCtx().setUserHasSelectedParty;

export function useInstanceOwnerParty() {
  const instance = useLaxInstanceData((data) => data);
  const parties = usePartiesAllowedToInstantiate();

  return getInstanceOwnerParty(instance, parties);
}

function getInstanceOwnerParty(instance?: IInstance | IInstanceOwner, parties?: IParty[]): IParty | undefined {
  if (!instance || !parties) {
    return undefined;
  }

  // This logic assumes that the current logged in user has "access" to the party of the instance owner,
  // as the parties array comes from the current users party list.
  const allParties = [...parties, ...parties.flatMap((party) => party.childParties ?? [])];
  const instanceOwner = 'instanceOwner' in instance ? instance.instanceOwner : instance;
  return allParties.find((party) => party.partyId.toString() === instanceOwner.partyId);
}
