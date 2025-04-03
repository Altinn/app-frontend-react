import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useStore } from 'zustand';

import { instanceStore } from 'src/next/stores/instanceStore';

export const Instance = () => {
  const { instance } = useStore(instanceStore); //instanceStore.getState();
  return (
    <div>
      {instance?.process.currentTask.elementId && <Navigate to={`${instance?.process.currentTask.elementId}`} />}
      <Outlet />
    </div>
  );
};
