import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { useLayoutSetSettings } from 'src/POC/hooks/useLayout';

export function Task() {
  const { taskId, pageId } = useParams();
  const { data: layoutSetSettings } = useLayoutSetSettings(taskId);

  const firstPage = layoutSetSettings?.pages.order[0];

  if (!pageId) {
    return firstPage ? <Navigate to={`${firstPage}`} /> : <div>No pages</div>;
  }

  return <Outlet />;
}
