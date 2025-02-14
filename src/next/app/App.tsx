import React, { useEffect, useState } from 'react';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from 'zustand';

import { Api } from 'src/next/app/api';
import { ApiClientProvider } from 'src/next/app/ApiClientContext';
import { Instance } from 'src/next/pages/Instance';
import { Instances } from 'src/next/pages/Instances';
import { Page } from 'src/next/pages/Page';
import { Task } from 'src/next/pages/Task';
import { layoutStore } from 'src/next/stores/layoutStore';
import { initialStateStore } from 'src/next/stores/settingsStore';
import { useInstantiateMutation } from 'src/next/v1/mutations/intanceMutation';

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
      // console.log(res);
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
              element={<Instance />}
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

            {/*<Route*/}
            {/*  path='/instance/:partyId/:instanceGuid/*'*/}
            {/*  element={<Instance />}*/}
            {/*>*/}
            {/*  <Route*/}
            {/*    path=':taskId'*/}
            {/*    element={<Task />}*/}
            {/*  >*/}
            {/*    <Route*/}
            {/*      path=':pageId'*/}
            {/*      element={<Page />}*/}
            {/*    />*/}
            {/*  </Route>*/}
            {/*</Route>*/}
          </Routes>
        </HashRouter>
      </QueryClientProvider>
    </ApiClientProvider>
  );
};

function InitialStateComponent() {
  const { isPending, data, isSuccess, mutate } = useInstantiateMutation();
  const navigate = useNavigate();
  const store = useStore(initialStateStore);
  const [isLoading, setIsLoading] = useState(false);

  const layout = useStore(layoutStore);

  useEffect(() => {
    if (store.user && !isLoading) {
      mutate(store.user.partyId);
      setIsLoading(true);
    }
  }, [isLoading, isPending, mutate, store]);

  useEffect(() => {
    if (isSuccess && data?.id) {
      navigate(`/instance/${data.id}/${layout.process.currentTask.elementId}`);
    }
  }, [data?.id, isSuccess, layout.process.currentTask.elementId, navigate]);

  return <div>Initial state</div>;
}

//element={<InitialStateComponent />}
