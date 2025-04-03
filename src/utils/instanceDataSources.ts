import type { IInstance, IInstanceDataSources } from 'src/types/shared';

export function buildInstanceDataSources(instance?: IInstance | null | undefined): IInstanceDataSources | null {
  if (!instance?.instanceOwner) {
    return null;
  }
  const instanceOwnerPartyType = instance.instanceOwner.organisationNumber
    ? 'org'
    : instance.instanceOwner.personNumber
      ? 'person'
      : instance.instanceOwner.username
        ? 'selfIdentified'
        : 'unknown';

  // instanceOwnerName is set to 'unknown' if the instanceOwner is not an organisation
  const instanceOwnerName = instance.instanceOwner.organisationNumber ? instance.instanceOwner?.party?.name : 'unknown';

  return {
    appId: instance.appId,
    instanceId: instance.id,
    instanceOwnerPartyId: instance.instanceOwner?.partyId,
    instanceOwnerPartyType,
    instanceOwnerName,
  };
}
