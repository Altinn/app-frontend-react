import type { IParty } from 'src/types/shared';

export interface IPartyState {
  selectedParty: IParty | undefined;
}

export interface ISelectPartyFulfilled {
  party: IParty | undefined;
}

export interface IPartyValidationResponse {
  valid: boolean;
  message: string | null;
  validParties: unknown[];
}
