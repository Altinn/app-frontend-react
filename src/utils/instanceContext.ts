import Moment from 'moment';
import { createSelector } from 'reselect';

import type { IRuntimeState } from 'src/types';
import type { IAltinnOrgs, IAppLanguage, IInstance, IInstanceContext, IParty } from 'src/types/shared';

const getInstance = (state: IRuntimeState) => state.instanceData.instance;
const getParties = (state: IRuntimeState) => state.party.parties;

export function buildInstanceContext(
  instance?: IInstance | null,
  parties?: IParty[] | null,
  allOrgs?: IAltinnOrgs | null,
  appLanguage?: IAppLanguage | null,
): IInstanceContext | null {
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
      appId: instance.appId,
      instanceId: instance.id,
      instanceOwnerPartyId: instance.instanceOwner.partyId,
      instanceDateSent: Moment(instance.lastChanged).format('DD.MM.YYYY'),
      instanceGuid: instance.id.split('/')[1].split('-')[4],
    };
  }

  return {
    appId: instance.appId,
    instanceId: instance.id,
    instanceOwnerPartyId: instance.instanceOwner.partyId,
    instanceDateSent: Moment(instance.lastChanged).format('DD.MM.YYYY'),
    instanceSender: `${instanceOwnerParty.ssn ? instanceOwnerParty.ssn : instanceOwnerParty.orgNumber}-${
      instanceOwnerParty.name
    }`,
    instanceReceiver: allOrgs[instance.org]
      ? allOrgs[instance.org].name[appLanguage.language]
      : 'Error: Receiver org not found',
    instanceGuid: instance.id.split('/')[1].split('-')[4],
  };
}

let selector: any = undefined;
export const getInstanceContextSelector = () => {
  if (selector) {
    return selector;
  }

  selector = createSelector([getInstance, getParties], (instance, parties) => buildInstanceContext(instance, parties));

  return selector;
};
