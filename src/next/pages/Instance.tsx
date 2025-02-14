import React, { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import { useApiClient } from 'src/next/app/ApiClientContext';
import { APP, ORG } from 'src/next/app/App';
import { dataStore } from 'src/next/stores/dataStore';
import { instanceStore } from 'src/next/stores/instanceStore';
import { layoutStore } from 'src/next/stores/layoutStore';
import { useInstanceQuery } from 'src/next/v1/queries/instanceQuery';
import type { InstanceDTO } from 'src/next/types/InstanceDTO';

type InstanceParams = {
  partyId: string;
  instanceGuid: string;
};

export const Instance = () => {
  const { partyId, instanceGuid } = useParams<InstanceParams>() as Required<InstanceParams>;

  const { data, error, isLoading } = useInstanceQuery(partyId, instanceGuid);

  const { instance, setInstance } = useStore(instanceStore);

  useEffect(() => {
    if (data && !instance) {
      setInstance(data);
    }
  }, [data, instance, setInstance]);

  const apiClient = useApiClient();

  const { setLayoutSets } = useStore(layoutStore);

  const { setDataObject } = useStore(dataStore);

  useEffect(() => {
    const fetchTest = async () => {
      const res = await apiClient.org.layoutsetsDetail(ORG, APP);
      const data = await res.json();
      setLayoutSets(data);
    };

    fetchTest();
  }, [apiClient.org, setLayoutSets]);

  useEffect(() => {
    const fetchData = async (instance: InstanceDTO) => {
      if (!instance.instanceOwner.partyId) {
        throw new Error('no party id');
      }
      const res = await apiClient.org.dataDetail(
        ORG,
        APP,
        Number.parseInt(instance.instanceOwner.partyId),
        instance.data[0].instanceGuid,
        instance.data[0].id,
      );
      const data = await res.json();
      setDataObject(data);
    };

    if (instance) {
      fetchData(instance);
    }
  }, [instance]);

  if (isLoading) {
    return <h2>Loading instance, please wait</h2>;
  }

  return (
    <div>
      <Outlet />
      {/*<h1>Instance</h1>*/}
      {/*<div>{partyId}</div>*/}
      {/*<div> {instanceGuid}</div>*/}
      {/*<Link to={`${data?.process.currentTask.elementId}`}>{data?.process.currentTask.elementId}</Link>*/}

      {/*<h2>Instance</h2>*/}

      {/*<pre>{JSON.stringify(instance, null, 2)}</pre>*/}
    </div>
  );
};
