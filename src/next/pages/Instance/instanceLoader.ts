import type { LoaderFunctionArgs } from 'react-router-dom';

import { API_CLIENT, APP, ORG } from 'src/next/app/App';
import { instanceStore } from 'src/next/stores/instanceStore';
import { layoutStore } from 'src/next/stores/layoutStore';
import { initialStateStore } from 'src/next/stores/settingsStore';

type InstanceParams = {
  partyId: string;
  instanceGuid: string;
};

export async function instanceLoaderFn({ partyId, instanceGuid }: InstanceParams) {
  const { instance } = instanceStore.getState();

  let localInstance = instance;
  if (!partyId || !instanceGuid) {
    throw new Error('missing url params');
  }
  const { validParties } = initialStateStore.getState();

  const currentParty = validParties[0];
  if (!currentParty) {
    throw new Error('No valid parties');
  }

  if (!instance) {
    const res = await API_CLIENT.org.instancesDetail(ORG, APP, parseInt(partyId), instanceGuid); //fetch('/api/users');
    const instance = await res.json();
    instanceStore.setState({ instance });
    localInstance = instance;
  }

  if (!localInstance) {
    throw new Error('No instance');
  }

  const res = await API_CLIENT.org.dataDetail(
    ORG,
    APP,
    Number.parseInt(partyId),
    instanceGuid,
    localInstance.data[0].id,
  );
  const data = await res.json();
  layoutStore.getState().setDataObject(data);
  return {};
}

export async function instanceLoader({ params }: LoaderFunctionArgs<InstanceParams>) {
  console.log('instance loader');
  const { partyId, instanceGuid } = params;
  if (!partyId || !instanceGuid) {
    throw new Error('partyId, instanceGuid should be set');
  }
  await instanceLoaderFn({ partyId, instanceGuid });
  return {};
}
