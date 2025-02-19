import React, { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Api } from 'src/next/app/api';
import { ApiClientProvider } from 'src/next/app/ApiClientContext';
import { Instance } from 'src/next/pages/Instance';
import { Instances } from 'src/next/pages/Instances';
import { Page } from 'src/next/pages/Page';
import { Task } from 'src/next/pages/Task';

const queryClient = new QueryClient();

const { org, app } = window;
const origin = window.location.origin;

export const ORG = org;
export const APP = app;

export const appPath = `${origin}/${org}/${app}`;

export const App = () => {
  const api = new Api({
    baseUrl: origin, //appPath,
    // You can pass axios overrides or custom fetch here if desired
  });

  useEffect(() => {
    const fetchTest = async () => {
      const { data } = await api.org.v1ApplicationmetadataDetail(org, app);
    };

    fetchTest();
  }, [api.org]);

  return (
    <ApiClientProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Routes>
            <Route
              path='/'
              element={<Instances />}
            />

            <Route
              path='instance'
              element={<Instances />}
            >
              <Route
                path=':partyId/:instanceGuid'
                element={<Instance />}
              >
                <Route
                  path=':taskId'
                  element={<Task />}
                >
                  <Route
                    path=':pageId'
                    element={<Page />}
                  />
                </Route>
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </QueryClientProvider>
    </ApiClientProvider>
  );
};
