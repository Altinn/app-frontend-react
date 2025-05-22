import type { LoaderFunctionArgs } from 'react-router-dom';

import { API_CLIENT, APP, ORG } from 'src/next-prev/app/App/App';
import { instanceStore } from 'src/next-prev/stores/instanceStore';
import { layoutStore } from 'src/next-prev/stores/layoutStore';
import { initialStateStore } from 'src/next-prev/stores/settingsStore';
import type { DataObject } from 'src/next-prev/stores/layoutStore';

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
    const res = await API_CLIENT.org.instancesDetail(ORG, APP, parseInt(partyId), instanceGuid);
    const instance = await res.json();
    instanceStore.setState({ instance });
    localInstance = instance;
  }

  if (!localInstance) {
    throw new Error('No instance');
  }

  // all data types that have app logic are considered data models

  const fetchCalls = (localInstance.data ?? []).map(async ({ dataType: dataModelName, id: uuid }) => {
    const res = await API_CLIENT.org.dataDetail(ORG, APP, Number.parseInt(partyId), instanceGuid, uuid ?? '');
    return { dataModelName, data: await res.json() };
  });
  const dataModelData = await Promise.all(fetchCalls);

  const dataModelDataMap: { [key: string]: DataObject } = {};
  dataModelData.forEach(({ dataModelName, data }) => {
    if (!data || !dataModelName) {
      return;
    }
    dataModelDataMap[dataModelName] = data;
  });

  layoutStore.getState().setDataObject(dataModelDataMap);
  return {};
}

export async function instanceLoader({ params }: LoaderFunctionArgs<InstanceParams>) {
  const { partyId, instanceGuid } = params;
  if (!partyId || !instanceGuid) {
    throw new Error('partyId, instanceGuid should be set');
  }
  await instanceLoaderFn({ partyId, instanceGuid });
  return {};
}
