import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { useInstanceQuery } from 'src/next/v1/queries/instanceQuery';

type InstanceParams = {
  partyId: string;
  instanceGuid: string;
};

export const Instance = () => {
  const { partyId, instanceGuid } = useParams<InstanceParams>() as Required<InstanceParams>;

  const { data, error, isLoading } = useInstanceQuery(partyId, instanceGuid);

  if (isLoading) {
    return <h2>Loading instance, please wait</h2>;
  }

  return (
    <div>
      <Link to={`${data?.process.currentTask.elementId}`}>{data?.process.currentTask.elementId}</Link>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
