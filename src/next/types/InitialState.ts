import type { ApplicationMetadata } from 'src/features/applicationMetadata/types';
import type { IApplicationSettings, IParty, IProfile } from 'src/types/shared';

export interface InitialState {
  applicationMetadata: ApplicationMetadata;
  frontEndSettings: IApplicationSettings;
  user: IProfile;
  validParties: IParty[];
}
