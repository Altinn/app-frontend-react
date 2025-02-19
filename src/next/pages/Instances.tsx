import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import { useStore } from 'zustand/index';

import { useApiClient } from 'src/next/app/ApiClientContext';
import { APP, ORG } from 'src/next/app/App';
import { initialStateStore } from 'src/next/stores/settingsStore';
import { useActiveInstancesQuery } from 'src/next/v1/queries/instanceQuery';

export const Instances = () => {
  const settings = useStore(initialStateStore);

  const { user, validParties } = useStore(initialStateStore);

  const currentParty = validParties[0];

  const { data, isLoading } = useActiveInstancesQuery(`${currentParty.partyId}`);

  const apiClient = useApiClient();

  const createIntance = async () => {
    if (!user?.party?.partyId || !user?.profileSettingPreference?.language) {
      return;
    }

    if (validParties.length < 1) {
      return;
    }

    // @ts-ignore
    const xsrfCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      .split('=')[1];
    const headers = { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfCookie };

    const res = await apiClient.org.instancesCreate(
      ORG,
      APP,
      {
        instanceOwnerPartyId: currentParty.partyId, ///user.party.partyId, //user.partyId,
      },
      {
        headers,
      },
    );
    const data = await res.json();
  };

  if (isLoading) {
    return <h2>Loading instance, please wait</h2>;
  }

  return (
    <div>
      <Outlet />
      <h1>Active instances</h1>

      <button onClick={createIntance}>New instance</button>

      <ul>
        {data?.map((instance) => (
          <li key={instance.id}>
            <Link to={`/instance/${instance.id}`}>{instance.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
