// src/next/pages/Task.tsx
// import React from 'react';
// import { Navigate, Outlet, useParams } from 'react-router-dom';
//
// import { useStore } from 'zustand';
//
// import { layoutStore } from 'src/next/stores/layoutStore';
//
// type TaskParams = {
//   taskId: string;
// };
//
// export const Task = () => {
//   // We only need the taskId to figure out which layoutSet belongs here
//   const { taskId } = useParams<TaskParams>() as Required<TaskParams>;
//
//   // Grab whatever you need from the store
//   const { layoutSetsConfig, pageOrder, layouts } = useStore(layoutStore, (state) => ({
//     layoutSetsConfig: state.layoutSetsConfig,
//     pageOrder: state.pageOrder,
//     layouts: state.layouts,
//   }));
//
//   // Identify the layoutSet for the given taskId
//   const currentLayoutSet = layoutSetsConfig?.sets.find((layoutSet) => layoutSet.tasks.includes(taskId));
//   if (!currentLayoutSet) {
//     throw new Error(`Layoutset for task "${taskId}" not found`);
//   }
//
//   if (!pageOrder?.pages?.order?.length) {
//     return <h1>No pages found in pageOrder</h1>;
//   }
//
//   if (!layouts) {
//     return <h1>No layouts loaded</h1>;
//   }
//
//   return (
//     <div>
//       <Navigate to={pageOrder.pages.order[0]} />
//       <Outlet />
//     </div>
//   );
// };

import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import { useApiClient } from 'src/next/app/ApiClientContext';
import { APP, ORG } from 'src/next/app/App/App';
import { layoutStore } from 'src/next/stores/layoutStore';

type TaskParams = {
  taskId: string;
};

export const Task = () => {
  const { taskId } = useParams<TaskParams>() as Required<TaskParams>;

  const layoutSetsConfig = useStore(layoutStore, (state) => state.layoutSetsConfig);

  const pageOrder = useStore(layoutStore, (state) => state.pageOrder);

  const setPageOrder = useStore(layoutStore, (state) => state.setPageOrder);
  const setLayouts = useStore(layoutStore, (state) => state.setLayouts);

  const layouts = useStore(layoutStore, (state) => state.layouts);

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
