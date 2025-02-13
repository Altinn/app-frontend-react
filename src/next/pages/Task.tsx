import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import { Api } from 'src/next/app/api';
import { layoutStore } from 'src/next/stores/layoutStore';

type TaskParams = {
  taskId: string;
};

export const Task = () => {
  const { taskId } = useParams<TaskParams>() as Required<TaskParams>;
  //
  // const { data, error, isLoading } = useInstanceQuery(partyId, instanceGuid);
  //
  // if (isLoading) {
  //   return <h2>Loading instance, please wait</h2>;
  // }

  const api = new Api({
    baseUrl: 'https://example.com',
    // You can pass axios overrides or custom fetch here if desired
  });

  // api.org.layoutsDetail()

  // const { data } = useLayoutSettingsQueryDef();

  const layouts = useStore(layoutStore);

  return (
    <div>
      <h1>Task</h1>
      <h2>{taskId}</h2>

      <ul>
        {layouts.pageOrder.pages.order.map((page) => (
          <li key={page}>
            <Link to={page}>{page}</Link>
          </li>
        ))}
      </ul>

      {/*<Link to={`/${data?.process.currentTask.elementId}`}>{data?.process.currentTask.elementId}</Link>*/}

      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
    </div>
  );
};
