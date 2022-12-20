import React from 'react';

import { TextField } from '@altinn/altinn-design-system';
import { Grid } from '@material-ui/core';
import Moment from 'moment';

import type { PropsFromGenericComponent } from '..';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import type { IRuntimeState } from 'src/types';
import type { IAltinnOrgs, IInstance, ILanguage, IParty, IProfile } from 'src/types/shared';

export function InstanceInformationComponent({ elements }: PropsFromGenericComponent<'InstanceInformation'>) {
  const { dateSent, sender, receiver, referenceNumber } = elements || {};

  const instance: IInstance | null = useAppSelector((state: IRuntimeState) => state.instanceData.instance);
  const parties: IParty[] | null = useAppSelector((state: IRuntimeState) => state.party.parties);
  const allOrgs: IAltinnOrgs | null = useAppSelector((state: IRuntimeState) => state.organisationMetaData.allOrgs);
  const profile: IProfile | null = useAppSelector((state: IRuntimeState) => state.profile.profile);
  const userLanguage = profile?.profileSettingPreference.language || 'nb';
  const language: ILanguage | null = useAppSelector((state) => state.language.language);

  const instanceOwnerParty =
    instance &&
    parties?.find((party: IParty) => {
      return party.partyId.toString() === instance.instanceOwner.partyId;
    });

  const instanceSender =
    instanceOwnerParty &&
    language &&
    `${instanceOwnerParty.ssn ? instanceOwnerParty.ssn : instanceOwnerParty.orgNumber}-${instanceOwnerParty.name}`;

  return (
    <Grid
      item={true}
      container={true}
      xl={12}
    >
      {dateSent !== false && instance?.lastChanged !== undefined && language && (
        <Grid item={true}>
          <TextField
            value={`${getLanguageFromKey('receipt.date_sent', language)} : ${Moment(instance?.lastChanged).format(
              'DD.MM.YYYY',
            )}`}
            readOnly={true}
          />
        </Grid>
      )}
      {sender !== false && instanceOwnerParty && language && (
        <Grid item={true}>
          <TextField
            value={`${getLanguageFromKey('receipt.sender', language)} : ${instanceSender}`}
            readOnly={true}
          />
        </Grid>
      )}
      {receiver !== false && instance && allOrgs && (
        <Grid item={true}>
          <TextField
            value={
              allOrgs[instance?.org] && language
                ? `${getLanguageFromKey('receipt.receiver', language)} : ${allOrgs[instance.org].name[userLanguage]}`
                : 'Error: Receiver org not found'
            }
            readOnly={true}
          />
        </Grid>
      )}
      {referenceNumber !== false && instance && language && (
        <Grid item={true}>
          <TextField
            value={`${getLanguageFromKey('receipt.ref_num', language)} : ${instance.id.split('/')[1].split('-')[4]}`}
            readOnly={true}
          />
        </Grid>
      )}
    </Grid>
  );
}
