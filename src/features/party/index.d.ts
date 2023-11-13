import type { IParty } from 'src/types/shared';

export interface IPartyState {
  parties: IParty[] | undefined;
  selectedParty: IParty | undefined;
  autoRedirect?: boolean;
}

export interface IGetPartiesFulfilled {
  parties: IParty[];
}

export interface ISelectPartyFulfilled {
  party: IParty | undefined;
}

export interface IPartyValidationResponse {
  valid: boolean;
  message: string | null;
  validParties: unknown[];
}
