import { type IParty } from 'src/types/shared';
import type { ApplicationMetadata } from 'src/features/applicationMetadata/types';

export const flattenParties = (parties: IParty[]): IParty[] => {
  const result: IParty[] = [];
  const stack = [...parties];

  while (stack.length) {
    const current = stack.pop();
    if (current) {
      result.push(current);
      if (current.childParties) {
        stack.push(...current.childParties);
      }
    }
  }

  return result;
};

export const reduceToValidParties = (parties: IParty[], appMetadata: ApplicationMetadata): IParty[] => {
  const allParties = flattenParties(parties);
  const { partyTypesAllowed } = appMetadata;

  // Fun fact: If all party types are false then all are true
  if (Object.values(partyTypesAllowed).every((value) => !value)) {
    return allParties.filter((party) => !party.isDeleted && !party.onlyHierarchyElementWithNoAccess);
  }

  return allParties.filter(
    (party) => !party.isDeleted && !party.onlyHierarchyElementWithNoAccess && partyTypesAllowed[party.partyTypeName],
  );
};
