import React from 'react';
import { Navigate, Outlet, useLoaderData, useParams } from 'react-router-dom';

import { useStore } from 'zustand/index';

import { API_CLIENT, APP, ORG } from 'src/next/app/App';
import { megaStore } from 'src/next/stores/megaStore';

// @ts-ignore
const xsrfCookie = document.cookie
  .split('; ')
  .find((row) => row.startsWith('XSRF-TOKEN='))
  .split('=')[1];
const headers = { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfCookie };

export interface LoaderData {
  instanceId: string;
}

export async function initialLoader() {
  const { user, validParties, layoutSetsConfig } = megaStore.getState();

  const currentParty = validParties[0];
  if (!currentParty) {
    throw new Error('No valid parties');
  }

  const res = await API_CLIENT.org.activeDetail(ORG, APP, currentParty.partyId);

  const instances = await res.json();
  let instanceId = '';

  if (instances.length > 0) {
    instanceId = instances[0].id;
  } else {
    const res = await API_CLIENT.org.instancesCreate(
      ORG,
      APP,
      {
        instanceOwnerPartyId: currentParty.partyId,
      },
      {
        headers,
      },
    );
    const data = await res.json();

    instanceId = data.id;
  }

  if (!layoutSetsConfig) {
    const res = await API_CLIENT.org.layoutsetsDetail(ORG, APP);
    const data = await res.json();
    megaStore.getState().setLayoutSets(data);
  }

  if (user.profileSettingPreference.language) {
    const res = await API_CLIENT.org.v1TextsDetail(ORG, APP, user.profileSettingPreference.language);
    const data = await res.json();
    megaStore.setState({ textResource: data });
  }

  return { instanceId };
}

export const InstancesParent = () => {
  const params = useParams();
  const currentParty = useStore(megaStore, (state) => state.validParties[0]);

  const { instanceId } = useLoaderData() as LoaderData;
  if (!instanceId) {
    throw new Error('no instance ID');
  }

  if (!currentParty) {
    throw new Error('No valid parties');
  }
  return (
    <div>
      {!params.instanceGuid && instanceId && <Navigate to={`instance/${instanceId}`} />}
      <Outlet />
    </div>
  );
};
