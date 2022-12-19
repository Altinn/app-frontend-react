import React from 'react';

import { TextField } from '@altinn/altinn-design-system';
import { Grid } from '@material-ui/core';
import Moment from 'moment';

import type { PropsFromGenericComponent } from '..';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import type { IRuntimeState } from 'src/types';
import type { IAltinnOrgs, IInstance, IParty, IProfile } from 'src/types/shared';

export function InstanceInformationComponent({ elements }: PropsFromGenericComponent<'InstanceInformation'>) {
  const { dateSent, sender, receiver, referenceNumber } = elements || {};

  const instance: IInstance | null = useAppSelector((state: IRuntimeState) => state.instanceData.instance);
  const parties: IParty[] | null = useAppSelector((state: IRuntimeState) => state.party.parties);
  const allOrgs: IAltinnOrgs | null = useAppSelector((state: IRuntimeState) => state.organisationMetaData.allOrgs);
  const profile: IProfile | null = useAppSelector((state: IRuntimeState) => state.profile.profile);
  const userLanguage = profile?.profileSettingPreference.language || 'nb';

  const instanceOwnerParty =
    instance &&
    parties?.find((party: IParty) => {
      return party.partyId.toString() === instance.instanceOwner.partyId;
    });

  return (
    <Grid
      item={true}
      container={true}
      xs={12}
    >
      {dateSent !== false && instance?.lastChanged !== undefined && (
        <Grid item={true}>
          <TextField
            value={Moment(instance?.lastChanged).format('DD.MM.YYYY')}
            readOnly={true}
          />
        </Grid>
      )}
      {sender !== false && instanceOwnerParty && (
        <Grid item={true}>
          <TextField
            value={`${instanceOwnerParty.ssn ? instanceOwnerParty.ssn : instanceOwnerParty.orgNumber}-${
              instanceOwnerParty.name
            }`}
            readOnly={true}
          />
        </Grid>
      )}
      {receiver !== false && instance && allOrgs && (
        <Grid item={true}>
          <TextField
            value={allOrgs[instance?.org] ? allOrgs[instance.org].name[userLanguage] : 'Error: Receiver org not found'}
            readOnly={true}
          />
        </Grid>
      )}
      {referenceNumber !== false && instance && (
        <Grid item={true}>
          <TextField
            value={instance.id.split('/')[1].split('-')[4]}
            readOnly={true}
          />
        </Grid>
      )}
    </Grid>
  );
}
