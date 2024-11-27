import type { IncomingApplicationMetadata } from 'src/features/applicationMetadata/types';
import type { IApplicationSettings, IParty, IProfile } from 'src/types/shared';

export interface InitialState {
  applicationMetadata: IncomingApplicationMetadata;
  frontEndSettings: IApplicationSettings;
  user: IProfile;
  validParties: IParty[];
}
