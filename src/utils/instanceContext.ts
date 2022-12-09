import { createSelector } from 'reselect';

import type { IRuntimeState } from 'src/types';
import type { IAltinnOrgs, IAppLanguage, IInstance, IInstanceContext, IParty } from 'src/types/shared';

const getInstance = (state: IRuntimeState) => state.instanceData.instance;

export function buildInstanceContext(
  instance?: IInstance | null,
  party?: IParty | null,
  allOrgs?: IAltinnOrgs | null,
  appLanguage?: IAppLanguage | null,
): IInstanceContext | null {
  if (!instance) {
    return null;
  } else if (!party || !allOrgs || !appLanguage) {
    return {
      appId: instance.appId,
      instanceId: instance.id,
      instanceOwnerPartyId: instance.instanceOwner.partyId,
      instanceLastChanged: instance.lastChanged,
      instanceGuid: instance.id.split('/')[1].split('-')[4],
    };
  }

  return {
    appId: instance.appId,
    instanceId: instance.id,
    instanceOwnerPartyId: instance.instanceOwner.partyId,
    instanceLastChanged: instance.lastChanged,
    instanceSender: `${party.ssn ? party.ssn : party.orgNumber}-${party.name}`,
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

  selector = createSelector([getInstance], (instance) => buildInstanceContext(instance));

  return selector;
};
