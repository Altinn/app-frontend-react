import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

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
import { fetchAllParties } from 'src/queries/queries';
import { getCookieValue, setCookie } from 'src/utils/cookieUtils';
import type { IInstance, IInstanceOwner, IParty } from 'src/types/shared';

export const altinnPartyIdCookieName = 'AltinnPartyId';

const partyQueryKeys = {
  all: ['parties', 'allowedToInstantiate', false] as const,
  allowedToInstantiate: ['parties', 'allowedToInstantiate', true] as const,
  cookie: ['altinnPartyIdCookie'] as const,
};

// Also used for prefetching @see appPrefetcher.ts, partyPrefetcher.ts
export function usePartiesAllowedToInstantiateQueryDef(enabled: boolean) {
  const { fetchPartiesAllowedToInstantiate } = useAppQueries();
  return {
    queryKey: partyQueryKeys.allowedToInstantiate,
    queryFn: fetchPartiesAllowedToInstantiate,
    enabled,
  };
}

const usePartiesAllowedToInstantiateQuery = () => {
  const enabled = useShouldFetchProfile();

  const utils = useQuery(usePartiesAllowedToInstantiateQueryDef(enabled));

  useEffect(() => {
    utils.error && window.logError('Fetching parties failed:\n', utils.error);
  }, [utils.error]);

  return {
    ...utils,
    enabled,
  };
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
  currentParty: IParty | undefined;
  currentPartyIsValid: boolean | undefined;
  userHasSelectedParty: boolean | undefined;
  setUserHasSelectedParty: (hasSelected: boolean) => void;
  setParty: (party: IParty) => Promise<void>;
}

const { Provider: RealCurrentPartyProvider, useCtx: useCurrentPartyCtx } = createContext<CurrentParty>({
  name: 'CurrentParty',
  required: false,
  default: {
    currentParty: undefined,
    currentPartyIsValid: undefined,
    userHasSelectedParty: undefined,
    setUserHasSelectedParty: () => {
      throw new Error('CurrentPartyProvider not initialized');
    },
    setParty: () => {
      throw new Error('CurrentPartyProvider not initialized');
    },
  },
});

function useAltinnPartyIdCookie() {
  return useQuery({
    queryKey: partyQueryKeys.cookie,
    queryFn: () => getCookieValue(altinnPartyIdCookieName),
    enabled: true,
  });
}

const useSetAltinnPartyIdCookie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partyId: string | number | undefined) => {
      const value = partyId ?? '';
      setCookie({ name: altinnPartyIdCookieName, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyQueryKeys.cookie });
    },
  });
};

function findCookieParty(partyId: string | null | undefined, parties: IParty[]): IParty | undefined {
  if (!partyId) {
    return undefined;
  }

  return parties.find((party) => {
    if (party.partyId.toString() === partyId) {
      return true;
    }

    if (party.childParties) {
      return findCookieParty(partyId, party.childParties);
    }
  });
}

const CurrentPartyProvider = ({ children }: PropsWithChildren) => {
  const {
    data: allParties,
    isLoading: isLoadingParties,
    error: allPartiesError,
  } = useQuery({
    queryKey: partyQueryKeys.all,
    queryFn: fetchAllParties,
  });
  const validParties = useValidParties();

  const profile = useProfile();
  const [userHasSelectedParty, setUserHasSelectedParty] = useState(false);
  const { data: altinnPartyIdCookieValue, isLoading: isLoadingCookie, error: cookieError } = useAltinnPartyIdCookie();
  const { mutateAsync: setAltinnPartyIdCookie, error: mutationError } = useSetAltinnPartyIdCookie();

  if (!validParties?.length) {
    return <NoValidPartiesError />;
  }

  if (isLoadingCookie || isLoadingParties) {
    return <Loader reason='parties' />;
  }

  const error = cookieError ?? allPartiesError ?? mutationError;
  if (error) {
    return <DisplayError error={error} />;
  }

  const cookieParty = findCookieParty(altinnPartyIdCookieValue, allParties ?? []);

  const currentParty = altinnPartyIdCookieValue ? cookieParty : profile?.party;
  const currentPartyIsValid = currentParty && validParties?.some((party) => party.partyId === currentParty?.partyId);

  return (
    <RealCurrentPartyProvider
      value={{
        currentParty,
        currentPartyIsValid,
        userHasSelectedParty,
        setUserHasSelectedParty,
        setParty: async (party: IParty) => setAltinnPartyIdCookie(party.partyId),
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

export const usePartiesAllowedToInstantiate = () => usePartiesAllowedToInstantiateCtx() ?? [];

export const useCurrentParty = () => useCurrentPartyCtx().currentParty;

export const useSetCurrentParty = () => useCurrentPartyCtx().setParty;

export const useValidParties = () => usePartiesAllowedToInstantiate().filter((party) => !party.isDeleted);

export const useHasSelectedParty = () => useCurrentPartyCtx().userHasSelectedParty;

export const useSetHasSelectedParty = () => useCurrentPartyCtx().setUserHasSelectedParty;

export const useCurrentPartyIsValid = () => useCurrentPartyCtx().currentPartyIsValid;

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
