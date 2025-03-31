import React from 'react';
import { Navigate, Outlet, useLoaderData, useParams } from 'react-router-dom';

import { useStore } from 'zustand/index';

import { Header } from 'src/next/components/Header';
import { initialStateStore } from 'src/next/stores/settingsStore';

export interface LoaderData {
  instanceId: string;
}

export const AppLayout = () => {
  const params = useParams();
  const { validParties } = useStore(initialStateStore);
  const currentParty = validParties[0];

  const { instanceId } = useLoaderData() as LoaderData;
  if (!instanceId) {
    throw new Error('no instance ID');
  }

  if (!currentParty) {
    throw new Error('No valid parties');
  }
  return (
    <div>
      <Header />
      {!params.instanceGuid && instanceId && <Navigate to={`instance/${instanceId}`} />}
      <Outlet />
    </div>
  );
};
