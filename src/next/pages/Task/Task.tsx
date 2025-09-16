import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';

import { useStore } from 'zustand';

import type { FormEngine } from 'libs/FormEngine';
import { useApiClient } from 'src/next/app/ApiClientContext';
import { APP, ORG } from 'src/next/app/App/App';
import { layoutStore } from 'src/next/stores/layoutStore';

type TaskParams = {
  taskId: string;
  pageId?: string;
};

interface TaskProps {
  formEngine: FormEngine;
}

export const Task = ({ formEngine }: TaskProps) => {
  console.log('Task: Starting with FormEngine instance');
  
  const { taskId, pageId } = useParams<TaskParams>() as Required<TaskParams>;

  const navigate = useNavigate();

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
      console.log('Task: Loading layout details for layoutSet:', layoutSetId);
      
      const res = await apiClient.org.layoutsAllSettingsDetail(layoutSetId, ORG, APP);
      const data = await res.json();
      const settings = JSON.parse(data.settings);
      const layoutsJson = JSON.parse(data.layouts);

      console.log('Task: Loaded pageOrder:', settings);
      console.log('Task: Loaded layouts:', Object.keys(layoutsJson));

      // Set in old stores (for compatibility)
      setPageOrder(settings);
      setLayouts(layoutsJson);

      // Update FormEngine with layouts and page order
      formEngine.layout.setLayoutData({
        layoutSetsConfig: layoutSetsConfig || { sets: [] },
        pageOrder: settings,
        layouts: layoutsJson,
      });

      console.log('Task: Updated FormEngine with layouts and page order');
      console.log('Task: Progressive loading phase 3 complete - layouts and page order loaded');

      setIsLoading(false);
    }

    if (currentLayoutSet?.id) {
      void getLayoutDetails(currentLayoutSet.id);
    }
  }, [apiClient.org, currentLayoutSet?.id, setLayouts, setPageOrder, pageId, navigate, formEngine, layoutSetsConfig]);

  useEffect(() => {
    if (pageId) {
      navigate(pageId);
    }
  }, [navigate, pageId]);

  if (!currentLayoutSet) {
    throw new Error('Layoutset for task not found');
  }

  if (isLoading) {
    return <h1>Loading layouts...</h1>;
  }

  if (!pageOrder || !pageOrder.pages?.order?.length) {
    return <h1>No pages found in pageOrder</h1>;
  }

  if (!layouts) {
    return <h1>No layouts loaded</h1>;
  }

  return (
    <div>
      {!pageId && <Navigate to={`${pageOrder.pages.order[0]}`} />}
      <Outlet />
    </div>
  );
};
