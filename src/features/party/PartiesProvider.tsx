import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { createContext } from 'src/core/contexts/context';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { NoValidPartiesError } from 'src/features/instantiate/containers/NoValidPartiesError';
import { useProfile, useShouldFetchProfile } from 'src/features/profile/ProfileProvider';
import type { IInstance, IInstanceOwner, IParty } from 'src/types/shared';

export const altinnPartyIdCookieName = 'AltinnPartyId';

// Also used for prefetching @see appPrefetcher.ts, partyPrefetcher.ts
export function usePartiesAllowedToInstantiateQueryDef(enabled: boolean) {
  const { fetchPartiesAllowedToInstantiate } = useAppQueries();
  return {
    queryKey: ['partiesAllowedToInstantiate', enabled],
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
  currentParty: IParty | undefined | null;
  userHasSelectedParty: boolean | undefined;
  setUserHasSelectedParty: (hasSelected: boolean) => void;
  setParty: (party: IParty) => Promise<void>;
}

const { Provider: RealCurrentPartyProvider, useCtx: useCurrentPartyCtx } = createContext<CurrentParty>({
  name: 'CurrentParty',
  required: false,
  default: {
    currentParty: undefined,
    userHasSelectedParty: undefined,
    setUserHasSelectedParty: () => {
      throw new Error('CurrentPartyProvider not initialized');
    },
    setParty: () => {
      throw new Error('CurrentPartyProvider not initialized');
    },
  },
});

function getAltinnPartyIdCookie() {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${altinnPartyIdCookieName}=`))
      ?.split('=')[1] ?? null
  );
}

function setAltinnPartyIdCookie(partyId: string | number | undefined) {
  const value = partyId ?? '';
  document.cookie = `${altinnPartyIdCookieName}=${value};`;
}

function getCookieParty(partyId: string | null, parties: IParty[]): IParty | undefined {
  if (!partyId) {
    return undefined;
  }

  return parties.find((party) => {
    if (party.partyId.toString() === partyId) {
      return true;
    }

    if (party.childParties) {
      return getCookieParty(partyId, party.childParties);
    }
  });
}

function getRepresentedParty(
  cookieParty: IParty | undefined,
  profileParty: IParty | undefined,
  altinnPartyIdCookieValue: string | null,
): IParty | null {
  if (!altinnPartyIdCookieValue) {
    return profileParty ?? null;
  }

  return cookieParty ?? null;
}

const CurrentPartyProvider = ({ children }: PropsWithChildren) => {
  const validParties = useValidParties();
  const profile = useProfile();
  const [userHasSelectedParty, setUserHasSelectedParty] = useState(false);

  if (!validParties?.length) {
    return <NoValidPartiesError />;
  }

  const altinnPartyIdCookieValue = getAltinnPartyIdCookie();
  const cookieParty = getCookieParty(altinnPartyIdCookieValue, validParties);

  return (
    <RealCurrentPartyProvider
      value={{
        currentParty: getRepresentedParty(cookieParty, profile?.party, altinnPartyIdCookieValue),
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

export const usePartiesAllowedToInstantiate = () => usePartiesAllowedToInstantiateCtx();

export const useCurrentParty = () => useCurrentPartyCtx().currentParty;

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
