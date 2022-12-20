import React from 'react';

import { Grid } from '@material-ui/core';
import Moment from 'moment';

import type { PropsFromGenericComponent } from '..';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import AltinnSummaryTable from 'src/components/molecules/AltinnSummaryTable';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import type { IRuntimeState } from 'src/types';
import type { IAltinnOrgs, IInstance, ILanguage, IParty, IProfile } from 'src/types/shared';

export const returnInstanceMetaDataObject = (
  language?: ILanguage | null | undefined,
  instanceDateSent?: string | null | undefined,
  instanceSender?: string | null | undefined,
  instanceReceiver?: string | null | undefined,
  instanceReferenceNumber?: string | null | undefined,
) => {
  const obj: any = {};
  if (!language) {
    return null;
  }

  obj[getLanguageFromKey('receipt.date_sent', language)] = instanceDateSent;

  obj[getLanguageFromKey('receipt.sender', language)] = instanceSender;

  obj[getLanguageFromKey('receipt.receiver', language)] = instanceReceiver;

  obj[getLanguageFromKey('receipt.ref_num', language)] = instanceReferenceNumber;

  return obj;
};

// eslint-disable-next-line no-empty-pattern
export function InstanceInformationComponent({}: PropsFromGenericComponent<'InstanceInformation'>) {
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

  const instanceDateSent = Moment(instance?.lastChanged).format('DD.MM.YYYY');

  const instanceSender =
    instanceOwnerParty &&
    language &&
    `${instanceOwnerParty.ssn ? instanceOwnerParty.ssn : instanceOwnerParty.orgNumber}-${instanceOwnerParty.name}`;

  const instanceReceiver =
    allOrgs && instance && allOrgs[instance?.org] && language
      ? allOrgs[instance.org].name[userLanguage]
      : 'Error: Receiver org not found';

  const instanceReferenceNumber = instance && instance.id.split('/')[1].split('-')[4];

  const instanceMetaDataObject = returnInstanceMetaDataObject(
    language,
    instanceDateSent,
    instanceSender,
    instanceReceiver,
    instanceReferenceNumber,
  );

  return (
    <Grid
      item={true}
      container={true}
      xs={12}
    >
      <AltinnSummaryTable summaryDataObject={instanceMetaDataObject} />
    </Grid>
  );
}
