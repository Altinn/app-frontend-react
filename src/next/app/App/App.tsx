import React, { useEffect } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { scan } from 'react-scan';

import { Api } from 'src/next/app/api';
import { AppLayout } from 'src/next/app/App/AppLayout/AppLayout';
import { initialLoader } from 'src/next/app/App/AppLayout/initialLoader';
import { Instance } from 'src/next/pages/Instance/Instance';
import { instanceLoader } from 'src/next/pages/Instance/instanceLoader';
import { Page } from 'src/next/pages/Page/Page';
import { Task } from 'src/next/pages/Task/Task';

const { org, app } = window;
const origin = window.location.origin;

export const ORG = org;
export const APP = app;

export const API_CLIENT = new Api({
  baseUrl: origin,
});

const router = createHashRouter([
  {
    path: '/',
    loader: initialLoader,
    element: <AppLayout />,
    children: [
      {
        loader: instanceLoader,
        path: 'instance/:partyId/:instanceGuid',
        element: <Instance />,
        children: [
          {
            path: ':taskId',
            element: <Task />,
            children: [
              {
                path: ':pageId',
                element: <Page />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export const App = () => {
  useEffect(() => {
    // Make sure to run react-scan only after hydration
    scan({
      enabled: true,
    });
  }, []);

  return <RouterProvider router={router} />;
};
