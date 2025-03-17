import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import { useApiClient } from 'src/next/app/ApiClientContext';
import { APP, ORG } from 'src/next/app/App';
import { megaStore } from 'src/next/stores/megaStore';

// Adjust to match your real shape:
type TaskParams = {
  taskId: string;
};

export const Task = () => {
  const { taskId } = useParams<TaskParams>() as Required<TaskParams>;

  const layoutSetsConfig = useStore(megaStore, (state) => state.layoutSetsConfig);

  const pageOrder = useStore(megaStore, (state) => state.pageOrder);

  const setPageOrder = useStore(megaStore, (state) => state.setPageOrder);
  const setLayouts = useStore(megaStore, (state) => state.setLayouts);

  const layouts = useStore(megaStore, (state) => state.layouts);

  const apiClient = useApiClient();
  const [isLoading, setIsLoading] = useState(true);

  const currentLayoutSet = layoutSetsConfig?.sets.find((layoutSet) => layoutSet.tasks.includes(taskId));

  useEffect(() => {
    async function getLayoutDetails(layoutSetId: string) {
      const res = await apiClient.org.layoutsAllSettingsDetail(layoutSetId, ORG, APP);
      const data = await res.json();
      const settings = JSON.parse(data.settings);
      const layoutsJson = JSON.parse(data.layouts);

      setPageOrder(settings);
      setLayouts(layoutsJson);
      setIsLoading(false);
    }

    if (currentLayoutSet?.id) {
      void getLayoutDetails(currentLayoutSet.id);
    }
  }, [apiClient.org, currentLayoutSet?.id, setLayouts, setPageOrder]);

  if (!currentLayoutSet) {
    throw new Error('Layoutset for task not found');
  }

  if (isLoading) {
    return <h1>Loading</h1>;
  }

  if (!pageOrder || !pageOrder.pages?.order?.length) {
    return <h1>No pages found in pageOrder</h1>;
  }

  if (!layouts) {
    return <h1>No layouts loaded</h1>;
  }

  return (
    <div>
      <Navigate to={`${pageOrder.pages.order[0]}`} />
      <Outlet />
    </div>
  );
};
