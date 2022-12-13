import React from 'react';

import { TextField } from '@altinn/altinn-design-system';
import { Grid } from '@material-ui/core';
import Moment from 'moment';
import { createSelector } from 'reselect';

import type { IRuntimeState } from 'src/types';
import type { IAltinnOrgs, IAppLanguage, IInstance, IParty } from 'src/types/shared';

const getInstance = (state: IRuntimeState) => state.instanceData.instance;
const getParties = (state: IRuntimeState) => state.party.parties;

export interface IInstanceInformationProps {
  dateSent?: string;
  sender?: string;
  receiver?: string;
  referenceNumber?: string;
}

export interface IInstanceInformation {
  id: string;
  instanceInformationProps: IInstanceInformationProps;
  alignment: string;
}

export function buildInstanceInformationProps(
  instance?: IInstance | null,
  parties?: IParty[] | null,
  allOrgs?: IAltinnOrgs | null,
  appLanguage?: IAppLanguage | null,
): IInstanceInformationProps | null {
  let instanceOwnerParty: IParty | undefined = undefined;
  if (instance && instance.org && parties) {
    instanceOwnerParty = parties.find((party: IParty) => {
      return party.partyId.toString() === instance.instanceOwner.partyId;
    });
  }

  if (!instance) {
    return null;
  } else if (!instanceOwnerParty || !allOrgs || !appLanguage) {
    return {
      dateSent: Moment(instance.lastChanged).format('DD.MM.YYYY'),
      referenceNumber: instance.id.split('/')[1].split('-')[4],
    };
  }

  return {
    dateSent: Moment(instance.lastChanged).format('DD.MM.YYYY'),
    sender: `${instanceOwnerParty.ssn ? instanceOwnerParty.ssn : instanceOwnerParty.orgNumber}-${
      instanceOwnerParty.name
    }`,
    receiver: allOrgs[instance.org]
      ? allOrgs[instance.org].name[appLanguage.language]
      : 'Error: Receiver org not found',
    referenceNumber: instance.id.split('/')[1].split('-')[4],
  };
}

export default function InstanceInformation(instanceInfo: IInstanceInformation) {
  if (!instanceInfo.instanceInformationProps) {
    return null;
  }

  return (
    <Grid
      item={true}
      container={true}
      xs={12}
    >
      {instanceInfo.instanceInformationProps.dateSent && (
        <Grid item={true}>
          <TextField
            value={instanceInfo.instanceInformationProps.dateSent}
            readOnly={true}
          />
        </Grid>
      )}
      {instanceInfo.instanceInformationProps.sender && (
        <Grid item={true}>
          <TextField
            value={instanceInfo.instanceInformationProps.sender}
            readOnly={true}
          />
        </Grid>
      )}
      {instanceInfo.instanceInformationProps.receiver && (
        <Grid item={true}>
          <TextField
            value={instanceInfo.instanceInformationProps.receiver}
            readOnly={true}
          />
        </Grid>
      )}
      {instanceInfo.instanceInformationProps.referenceNumber && (
        <Grid item={true}>
          <TextField
            value={instanceInfo.instanceInformationProps.referenceNumber}
            readOnly={true}
          />
        </Grid>
      )}
    </Grid>
  );
}

let selector: any = undefined;
export const getInstanceInformationPropsSelector = () => {
  if (selector) {
    return selector;
  }

  selector = createSelector([getInstance, getParties], (instance, parties) =>
    buildInstanceInformationProps(instance, parties),
  );

  return selector;
};
