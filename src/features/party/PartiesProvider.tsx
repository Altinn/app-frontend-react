import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { useQuery } from '@tanstack/react-query';

import { createContext } from 'src/core/contexts/context';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { NoValidPartiesError } from 'src/features/instantiate/containers/NoValidPartiesError';
import { useProfile, useShouldFetchProfile } from 'src/features/profile/ProfileProvider';
import { fetchAllParties, fetchPartiesAllowedToInstantiate } from 'src/queries/queries';
import { httpGet, putWithoutConfig } from 'src/utils/network/networking';
import { currentPartyUrl, getSetCurrentPartyUrl } from 'src/utils/urls/appUrlHelper';
import type { IParty } from 'src/types/shared';

export const altinnPartyIdCookieName = 'AltinnPartyId';

const partyQueryKeys = {
  all: ['parties'] as const,
  allowedToInstantiate: () => [...partyQueryKeys.all, 'allowedToInstantiate'] as const,
  instanceOwnerParty: (instanceOwnerPartyId: string | undefined) =>
    [...partyQueryKeys.all, 'instanceOwnerParty', instanceOwnerPartyId] as const,
  cookie: ['altinnPartyIdCookie'] as const,
};

// Also used for prefetching @see appPrefetcher.ts, partyPrefetcher.ts
export function usePartiesAllowedToInstantiateQueryDef(enabled: boolean) {
  return {
    queryKey: partyQueryKeys.allowedToInstantiate(),
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
  setCurrentParty: (party: IParty) => Promise<void>;
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
    setCurrentParty: () => {
      throw new Error('CurrentPartyProvider not initialized');
    },
  },
});

function findParty(partyId: string | null | undefined, parties: IParty[]): IParty | undefined {
  if (!partyId) {
    return undefined;
  }

  return parties.find((party) => {
    if (party.partyId.toString() === partyId) {
      return true;
    }

    if (party.childParties) {
      return findParty(partyId, party.childParties);
    }
  });
}

const CurrentPartyProvider = ({ children }: PropsWithChildren) => {
  const {
    data: allParties,
    isLoading: isLoadingParties,
    error,
  } = useQuery({
    queryKey: partyQueryKeys.all,
    queryFn: fetchAllParties,
  });

  const profile = useProfile();
  const [currentPartyId, setCurrentPartyId] = useState<string | null>(
    getCookieValue(altinnPartyIdCookieName) ?? profile?.partyId.toString() ?? null,
  );
  const validParties = useValidParties();

  const [userHasSelectedParty, setUserHasSelectedParty] = useState(false);

  if (!validParties?.length) {
    return <NoValidPartiesError />;
  }

  if (isLoadingParties) {
    return <Loader reason='parties' />;
  }

  if (error) {
    return <DisplayError error={error} />;
  }

  const currentParty =
    currentPartyId === profile?.partyId.toString() ? profile.party : findParty(currentPartyId, allParties ?? []);
  const currentPartyIsValid = currentParty && validParties?.some((party) => party.partyId === currentParty?.partyId);

  return (
    <RealCurrentPartyProvider
      value={{
        currentParty,
        currentPartyIsValid,
        userHasSelectedParty,
        setUserHasSelectedParty,
        setCurrentParty: async (party: IParty) => setCurrentPartyId(party.partyId.toString()),
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

export const useSetCurrentParty = () => useCurrentPartyCtx().setCurrentParty;

export const useValidParties = () => usePartiesAllowedToInstantiate().filter((party) => !party.isDeleted);

export const useHasSelectedParty = () => useCurrentPartyCtx().userHasSelectedParty;

export const useSetHasSelectedParty = () => useCurrentPartyCtx().setUserHasSelectedParty;

export const useCurrentPartyIsValid = () => useCurrentPartyCtx().currentPartyIsValid;

export function useInstanceOwnerParty() {
  const { instanceOwnerPartyId } = useParams();

  const query = useQuery({
    queryKey: partyQueryKeys.instanceOwnerParty(instanceOwnerPartyId),
    queryFn: async () => {
      if (!instanceOwnerPartyId) {
        return null;
      }

      await putWithoutConfig(getSetCurrentPartyUrl(instanceOwnerPartyId));

      return httpGet<IParty>(currentPartyUrl);
    },
  });

  return { ...query, data: query.data };
}

function getCookieValue(name: string): string | null {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1] ?? null
  );
}
