import React, { useEffect } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { scan } from 'react-scan';

import { setAutoFreeze } from 'immer';

import { FormEngine } from 'libs/FormEngine';
import { Api } from 'src/next/app/api';
import { AppLayout } from 'src/next/app/App/AppLayout/AppLayout';
import { initialLoader } from 'src/next/app/App/AppLayout/initialLoader';
import { Instance } from 'src/next/pages/Instance/Instance';
import { instanceLoader } from 'src/next/pages/Instance/instanceLoader';
import { Page } from 'src/next/pages/Page/Page';
import { Task } from 'src/next/pages/Task/Task';

setAutoFreeze(false);

const { org, app } = window;
const origin = window.location.origin;

export const ORG = org;
export const APP = app;

export const API_CLIENT = new Api({
  baseUrl: origin,
});

// Create FormEngine instance at router level for progressive loading
const formEngineInstance = new FormEngine();
formEngineInstance.initializeEmpty();

const router = createHashRouter([
  {
    path: '/',
    loader: () => initialLoader(formEngineInstance),
    element: <AppLayout formEngine={formEngineInstance} />,
    children: [
      {
        loader: ({ params }) => instanceLoader({ params, formEngine: formEngineInstance }),
        path: 'instance/:partyId/:instanceGuid',
        element: <Instance />,
        children: [
          {
            path: ':taskId',
            element: <Task formEngine={formEngineInstance} />,
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
