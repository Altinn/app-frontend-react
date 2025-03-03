import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import { Api } from 'src/next/app/api';
import { Instance, instanceLoader } from 'src/next/pages/Instance';
import { initialLoader, InstancesParent } from 'src/next/pages/Instances';
import { Page } from 'src/next/pages/Page';
import { Task2 } from 'src/next/pages/Task';

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
    element: <InstancesParent />,
    children: [
      {
        loader: instanceLoader,
        path: 'instance/:partyId/:instanceGuid',
        element: <Instance />,
        children: [
          {
            path: ':taskId',
            element: <Task2 />,
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

export const App = () => <RouterProvider router={router} />;
