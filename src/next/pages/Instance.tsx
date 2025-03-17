import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';

import { useStore } from 'zustand';

import { API_CLIENT, APP, ORG } from 'src/next/app/App';
import { megaStore } from 'src/next/stores/megaStore';

type InstanceParams = {
  partyId: string;
  instanceGuid: string;
};

export async function instanceLoader({ params }: LoaderFunctionArgs<InstanceParams>) {
  const { partyId, instanceGuid } = params;
  const { instance, validParties } = megaStore.getState();

  let localInstance = instance;
  if (!partyId || !instanceGuid) {
    throw new Error('missing url params');
  }

  const currentParty = validParties[0];
  if (!currentParty) {
    throw new Error('No valid parties');
  }

  if (!instance) {
    const res = await API_CLIENT.org.instancesDetail(ORG, APP, parseInt(partyId), instanceGuid); //fetch('/api/users');
    const instance = await res.json();
    megaStore.setState({ instance });
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
  megaStore.getState().setDataObject(data);
  return {};
}

export const Instance = () => {
  const target = useStore(megaStore, (s) => s.instance?.process.currentTask.elementId);
  return (
    <div>
      {target && <Navigate to={target} />}
      <Outlet />
    </div>
  );
};
