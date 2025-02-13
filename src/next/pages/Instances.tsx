import React from 'react';
import { Link } from 'react-router-dom';

import { useStore } from 'zustand/index';

import { initialStateStore } from 'src/next/stores/settingsStore';
import { useActiveInstancesQuery } from 'src/next/v1/queries/instanceQuery';

export const Instances = () => {
  const settings = useStore(initialStateStore);

  const { data, error, isLoading } = useActiveInstancesQuery(`${settings.user.partyId}`);

  if (isLoading) {
    return <h2>Loading instance, please wait</h2>;
  }

  return (
    <div>
      <h1>Active instances</h1>

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
