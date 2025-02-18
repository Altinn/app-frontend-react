import React, { useEffect } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import { useApiClient } from 'src/next/app/ApiClientContext';
import { APP, ORG } from 'src/next/app/App';
import { instanceStore } from 'src/next/stores/instanceStore';
import { layoutStore } from 'src/next/stores/layoutStore';
import { initialStateStore } from 'src/next/stores/settingsStore';
import { textResourceStore } from 'src/next/stores/textResourceStore';
import { useInstanceQuery } from 'src/next/v1/queries/instanceQuery';
import type { InstanceDTO } from 'src/next/types/InstanceDTO';

type InstanceParams = {
  partyId: string;
  instanceGuid: string;
};

export const Instance = () => {
  const { partyId, instanceGuid } = useParams<InstanceParams>() as Required<InstanceParams>;

  const { data: loadedInstance, error, isLoading } = useInstanceQuery(partyId, instanceGuid);

  const { user } = useStore(initialStateStore);

  const { instance, setInstance } = useStore(instanceStore);

  const { layouts, setLayoutSets, setDataObject, data } = useStore(layoutStore);

  const { textResource, setTextResource } = useStore(textResourceStore);

  const apiClient = useApiClient();

  useEffect(() => {
    if (loadedInstance && !instance) {
      setInstance(loadedInstance);
    }
  }, [loadedInstance, instance, setInstance]);

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
  }, [apiClient.org, instance, setDataObject]);

  useEffect(() => {
    const getTexts = async () => {
      if (user.profileSettingPreference.language) {
        const res = await apiClient.org.v1TextsDetail(ORG, APP, user.profileSettingPreference.language);
        const data = await res.json();
        setTextResource(data);
      }
    };
    getTexts();
  }, [apiClient.org, setTextResource, user.profileSettingPreference.language]);

  if (isLoading) {
    return <h2>Loading instance, please wait</h2>;
  }

  return (
    <div>
      {!data && 'Loading data..'}

      {/*{!layouts && 'Loading layouts...'}*/}

      {data && instance && <Outlet />}

      {/*<h1>Instance</h1>*/}
      {/*<div>{partyId}</div>*/}
      {/*<div> {instanceGuid}</div>*/}
      <Link to={`${instance?.process.currentTask.elementId}`}>{instance?.process.currentTask.elementId}</Link>

      {/*<h2>Instance</h2>*/}

      {/*<pre>{JSON.stringify(instance, null, 2)}</pre>*/}
    </div>
  );
};
