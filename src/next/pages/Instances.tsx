import React from 'react';
import { Link } from 'react-router-dom';

import { useStore } from 'zustand/index';

import { useApiClient } from 'src/next/app/ApiClientContext';
import { APP, ORG } from 'src/next/app/App';
import { initialStateStore } from 'src/next/stores/settingsStore';
import { useActiveInstancesQuery } from 'src/next/v1/queries/instanceQuery';

export const Instances = () => {
  const settings = useStore(initialStateStore);

  const { data, error, isLoading } = useActiveInstancesQuery(`${settings.user.partyId}`);

  const apiClient = useApiClient();

  const { user } = useStore(initialStateStore);
  const createIntance = async () => {
    const res = await apiClient.org.instancesCreate(ORG, APP, {
      instanceOwnerPartyId: user.partyId,
      language: user.profileSettingPreference.language || '',
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  };

  if (isLoading) {
    return <h2>Loading instance, please wait</h2>;
  }

  return (
    <div>
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
