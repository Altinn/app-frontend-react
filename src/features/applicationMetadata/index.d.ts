import type { IDataType, ITitle } from 'src/types/shared';

export interface IApplicationMetadata {
  createdBy: string;
  created: string;
  dataTypes: IDataType[];
  id: string;
  lastChangedBy: string;
  lastChanged: string;
  org: string;
  partyTypesAllowed: IPartyTypesAllowed;
  title: ITitle;
  autoDeleteOnProcessEnd: boolean;
  onEntry?: IOnEntry;
  features?: Partial<IBackendFeaturesState>;
  promptForParty?: 'always' | 'never';
}

export interface IApplicationMetadataState {
  applicationMetadata: IApplicationMetadata | null;
  error: Error | null;
}

export interface IOnEntry {
  show: ShowTypes;
  instanceSelection?: IInstanceSelection;
}

export type ShowTypes = 'new-instance' | 'select-instance' | 'startpage' | string;

export type IInstanceSelection = {
  rowsPerPageOptions: number[];
  defaultRowsPerPage: number;
  sortDirection: 'asc' | 'desc';
};

interface IPartyTypesAllowed {
  bankruptcyEstate: boolean;
  organisation: boolean;
  person: boolean;
  subUnit: boolean;
}

export interface IGetApplicationMetadataFulfilled {
  applicationMetadata: IApplicationMetadata;
}

export interface IGetApplicationMetadataRejected {
  error: Error;
}

export interface IBackendFeaturesState {
  footer: boolean;
  multiPartSave: boolean;
  processActions: boolean;
  jsonObjectInDataResponse: boolean; // Extended attachment validation
}
