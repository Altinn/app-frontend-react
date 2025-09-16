import type { LoaderFunctionArgs } from 'react-router-dom';

import type { FormEngine } from 'libs/FormEngine';
import { API_CLIENT, APP, ORG } from 'src/next/app/App/App';
import { instanceStore } from 'src/next/stores/instanceStore';
import { layoutStore } from 'src/next/stores/layoutStore';
import { initialStateStore } from 'src/next/stores/settingsStore';

type InstanceParams = {
  partyId: string;
  instanceGuid: string;
};

type InstanceLoaderParams = InstanceParams & {
  formEngine: FormEngine;
};

export async function instanceLoaderFn({ partyId, instanceGuid, formEngine }: InstanceLoaderParams) {
  console.log('instanceLoader: Starting with FormEngine instance');
  
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

  const res = await API_CLIENT.org.dataDetail(
    ORG,
    APP,
    Number.parseInt(partyId),
    instanceGuid,
    localInstance.data[0].id,
  );
  const data = await res.json();
  
  // Set data in old store (for compatibility)
  layoutStore.getState().setDataObject(data);

  // Set real form data in FormEngine
  formEngine.data.setData(data);
  
  console.log('instanceLoader: Set real form data in FormEngine:', data);
  console.log('instanceLoader: Progressive loading phase 2 complete - form data loaded');
  
  // Verify data was set
  const storedData = formEngine.data.getData();
  console.log('instanceLoader: Verified FormEngine data:', Object.keys(storedData || {}));

  return {};
}

export async function instanceLoader({ params, formEngine }: { params: any; formEngine: FormEngine }) {
  const { partyId, instanceGuid } = params;
  if (!partyId || !instanceGuid) {
    throw new Error('partyId, instanceGuid should be set');
  }
  await instanceLoaderFn({ partyId, instanceGuid, formEngine });
  return {};
}
