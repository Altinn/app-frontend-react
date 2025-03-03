import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import { useApiClient } from 'src/next/app/ApiClientContext';
import { APP, ORG } from 'src/next/app/App';
import { layoutStore } from 'src/next/stores/layoutStore';

type TaskParams = {
  taskId: string;
};

export const Task2 = () => {
  const { taskId } = useParams<TaskParams>() as Required<TaskParams>;

  const { layouts, resolvedLayouts, layoutSetsConfig, pageOrder, setPageOrder, setLayouts } = useStore(layoutStore);

  const currentLayoutSet = layoutSetsConfig.sets.find((layoutSet) => layoutSet.tasks.includes(taskId));
  const apiClient = useApiClient();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getLayoutDetails(layoutSetId: string) {
      const res = await apiClient.org.layoutsAllSettingsDetail(layoutSetId, ORG, APP);
      const data = await res.json();
      const settings = JSON.parse(data.settings);
      const layouts = JSON.parse(data.layouts);
      setPageOrder(settings);
      setLayouts(layouts);
      setIsLoading(false);
    }

    if (currentLayoutSet?.id) {
      getLayoutDetails(currentLayoutSet?.id);
    }
  }, [apiClient.org, currentLayoutSet?.id, setLayouts, setPageOrder]);

  if (!currentLayoutSet) {
    throw new Error('Layoutset for task not found');
  }

  if (isLoading) {
    return <h1>Loading</h1>;
  }
  return (
    <div>
      {pageOrder && layouts && resolvedLayouts && layoutSetsConfig && <Navigate to={`${pageOrder.pages.order[0]}`} />}
      <Outlet />
    </div>
  );
};
