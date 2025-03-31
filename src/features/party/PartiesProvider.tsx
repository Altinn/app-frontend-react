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
import { fetchAllParties, fetchInstanceOwnerParty, fetchPartiesAllowedToInstantiate } from 'src/queries/queries';
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

interface SelectedParty {
  selectedParty: IParty | undefined;
  selectedPartyIsValid: boolean | undefined;
  userHasSelectedParty: boolean | undefined;
  setUserHasSelectedParty: (hasSelected: boolean) => void;
  setSelectedParty: (party: IParty) => Promise<void>;
}

const { Provider: RealSelectedPartyProvider, useCtx: useSelectedPartyCtx } = createContext<SelectedParty>({
  name: 'SelectedParty',
  required: false,
  default: {
    selectedParty: undefined,
    selectedPartyIsValid: undefined,
    userHasSelectedParty: undefined,
    setUserHasSelectedParty: () => {
      throw new Error('SelectedPartyProvider not initialized');
    },
    setSelectedParty: () => {
      throw new Error('SelectedPartyProvider not initialized');
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

const SelectedPartyProvider = ({ children }: PropsWithChildren) => {
  const {
    data: allParties,
    isLoading: isLoadingParties,
    error,
  } = useQuery({
    queryKey: partyQueryKeys.all,
    queryFn: fetchAllParties,
  });

  const profile = useProfile();
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(
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

  const selectedParty =
    selectedPartyId === profile?.partyId.toString() ? profile.party : findParty(selectedPartyId, allParties ?? []);
  const selectedPartyIsValid = selectedParty && validParties?.some((party) => party.partyId === selectedParty?.partyId);

  return (
    <RealSelectedPartyProvider
      value={{
        selectedParty,
        selectedPartyIsValid,
        userHasSelectedParty,
        setUserHasSelectedParty,
        setSelectedParty: async (party: IParty) => setSelectedPartyId(party.partyId.toString()),
      }}
    >
      {children}
    </RealSelectedPartyProvider>
  );
};

export function PartyProvider({ children }: PropsWithChildren) {
  const shouldFetchProfile = useShouldFetchProfile();

  if (!shouldFetchProfile) {
    return children;
  }

  return (
    <PartiesProvider>
      <SelectedPartyProvider>{children}</SelectedPartyProvider>
    </PartiesProvider>
  );
}

export const usePartiesAllowedToInstantiate = () => usePartiesAllowedToInstantiateCtx() ?? [];

export const useSelectedParty = () => useSelectedPartyCtx().selectedParty;

export const useSetSelectedParty = () => useSelectedPartyCtx().setSelectedParty;

export const useValidParties = () => usePartiesAllowedToInstantiate().filter((party) => !party.isDeleted);

export const useHasSelectedParty = () => useSelectedPartyCtx().userHasSelectedParty;

export const useSetHasSelectedParty = () => useSelectedPartyCtx().setUserHasSelectedParty;

export const useSelectedPartyIsValid = () => useSelectedPartyCtx().selectedPartyIsValid;

export function useInstanceOwnerParty() {
  const { instanceOwnerPartyId } = useParams();

  return useQuery({
    queryKey: partyQueryKeys.instanceOwnerParty(instanceOwnerPartyId),
    queryFn: () => fetchInstanceOwnerParty(instanceOwnerPartyId),
  });
}

function getCookieValue(name: string): string | null {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1] ?? null
  );
}
