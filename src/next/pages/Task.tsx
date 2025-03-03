import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import { useApiClient } from 'src/next/app/ApiClientContext';
import { APP, ORG } from 'src/next/app/App';
import { layoutStore } from 'src/next/stores/layoutStore';

type TaskParams = {
  taskId: string;
};

export const Task = () => {
  const { taskId } = useParams<TaskParams>() as Required<TaskParams>;

  const { layouts, resolvedLayouts, layoutSetsConfig, pageOrder, setPageOrder, setLayouts } = useStore(layoutStore);

  const currentLayoutSet = layoutSetsConfig.sets.find((layoutSet) => layoutSet.tasks.includes(taskId));
  const apiClient = useApiClient();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getLatoutDetails(layoutSetId: string) {
      const res = await apiClient.org.layoutsAllSettingsDetail(layoutSetId, ORG, APP);
      const data = await res.json();
      const settings = JSON.parse(data.settings);
      const layouts = JSON.parse(data.layouts);
      setPageOrder(settings);
      setLayouts(layouts);
      setIsLoading(false);
    }

    if (currentLayoutSet?.id) {
      getLatoutDetails(currentLayoutSet?.id);
    }
  }, [apiClient.org, currentLayoutSet?.id, setLayouts, setPageOrder]);

  if (!currentLayoutSet) {
    throw new Error('Layoutset for task not found');
  }

  if (pageOrder && layouts && resolvedLayouts && layoutSetsConfig) {
    // return <Outlet />;
    return <Navigate to={`${pageOrder.pages.order[0]}`} />;
  }
  if (isLoading) {
    return <h1>Loading</h1>;
  }
  return (
    <div>
      task
      <Outlet />
    </div>
  );

  // return (
  //   <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem', height: '100%' }}>
  //     <aside style={{ border: '1px solid gray' }}>
  //       {pageOrder && (
  //         <ul>
  //           {pageOrder.pages.order?.map((page) => (
  //             <li key={page}>
  //               <Link to={page}>{page}</Link>
  //             </li>
  //           ))}
  //         </ul>
  //       )}
  //     </aside>
  //     <main style={{ border: '1px solid black' }}>{pageOrder && <Outlet />}</main>
  //     {/*<h2>Pages</h2>*/}
  //
  //     {/*<h2>Current layoutset</h2>*/}
  //
  //     {/*<pre>{JSON.stringify(currentLayoutSet, null, 2)}</pre>*/}
  //
  //     {/*<h1>Task we at</h1>*/}
  //     {/*<h2>{taskId}</h2>*/}
  //
  //     {/*<pre>{JSON.stringify(layoutSetsConfig, null, 2)}</pre>*/}
  //   </div>
  // );
};
