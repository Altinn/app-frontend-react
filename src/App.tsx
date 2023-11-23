import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ProcessWrapper } from 'src/components/wrappers/ProcessWrapper';
import { Entrypoint } from 'src/features/entrypoint/Entrypoint';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { InstanceSelectionWrapper } from 'src/features/instantiate/selection/InstanceSelection';

export const App = () => (
  <Routes>
    <Route
      path='/'
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
          <ProcessWrapper />
        </InstanceProvider>
      }
    />
    <LegacyRoutes />
  </Routes>
);

const LegacyRoutes = () => (
  <Route
    path='/partyselection/*'
    element={
      // Rewrites to the new URL
      // PRIORITY: Make sure to test that this works (even with /party-selection/403)
      <Navigate
        to='/party-selection/'
        replace={true}
      />
    }
  />
);
