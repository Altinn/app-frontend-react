import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { ProcessWrapper } from 'src/components/wrappers/ProcessWrapper';
import { Entrypoint } from 'src/features/entrypoint/Entrypoint';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';

export const App = () => (
  <Routes>
    <Route
      path='/'
      element={<Entrypoint />}
    />
    <Route
      path='/partyselection/*'
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
  </Routes>
);
