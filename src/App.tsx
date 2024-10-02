import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { Form, FormFirstPage } from 'src/components/form/Form';
import { NavigateToStartUrl, ProcessWrapper } from 'src/components/wrappers/ProcessWrapper';
import { Entrypoint } from 'src/features/entrypoint/Entrypoint';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { InstanceSelectionWrapper } from 'src/features/instantiate/selection/InstanceSelection';

export const App = () => (
  <Routes>
    <Route
      path='*'
      element={<Entrypoint />}
    />
    <Route
      path='/instance-selection/*'
      element={<InstanceSelectionWrapper />}
    />
    <Route
      path='/party-selection/*'
      element={<PartySelection />}
    />
    <Route
      path='/instance/:partyId/:instanceGuid'
      element={
        <InstanceProvider>
          <Outlet />
        </InstanceProvider>
      }
    >
      <Route
        index
        element={<NavigateToStartUrl />}
      />
      <Route
        path=':taskId'
        element={<ProcessWrapper />}
      >
        <Route
          index
          element={<FormFirstPage />}
        />
        <Route
          path=':pageKey'
          element={<Form />}
        />
      </Route>
    </Route>

    {/**
     * Redirects from legacy URLs to new URLs
     */}
    <Route
      path='/partyselection/*'
      element={
        <Navigate
          to='/party-selection/'
          replace={true}
        />
      }
    />
  </Routes>
);
