import React from 'react';
import { Navigate, Outlet, useLoaderData, useParams } from 'react-router-dom';

import type { FormEngine } from 'libs/FormEngine';
import { FormEngineProvider } from 'libs/FormEngineReact';
import { defaultComponentMap } from 'libs/LayoutComponents';
import { useStore } from 'zustand/index';

import classes from 'src/next/app/App/AppLayout/AppLayout.module.css';
import { Header } from 'src/next/components/Header';
import { initialStateStore } from 'src/next/stores/settingsStore';

export interface LoaderData {
  instanceId: string;
}

interface AppLayoutProps {
  formEngine: FormEngine;
}

export const AppLayout = ({ formEngine }: AppLayoutProps) => {
  console.log('AppLayout: Received FormEngine instance from router');
  
  const params = useParams();
  const { validParties } = useStore(initialStateStore);
  const currentParty = validParties[0];

  const { instanceId } = useLoaderData() as LoaderData;
  if (!instanceId) {
    throw new Error('no instance ID');
  }

  if (!currentParty) {
    throw new Error('No valid parties');
  }

  console.log('AppLayout: Setting up FormEngineProvider with router-level FormEngine');

  return (
    <FormEngineProvider
      engine={formEngine}
      componentMap={defaultComponentMap}
    >
      <div className={classes.container}>
        <Header />
        {!params.instanceGuid && instanceId && <Navigate to={`instance/${instanceId}`} />}
        <main className={classes.mainContent}>
          <section
            id='main-content'
            className={classes.mainSection}
            tabIndex={-1}
          >
            <div className={classes.contentPadding}>
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </FormEngineProvider>
  );
};
