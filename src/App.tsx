import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ProcessWrapperWrapper } from 'src/components/wrappers/ProcessWrapper';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { Entrypoint } from 'src/features/entrypoint/Entrypoint';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { InstantiateContainer } from 'src/features/instantiate/containers/InstantiateContainer';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { InstanceSelectionWrapper } from 'src/features/instantiate/selection/InstanceSelection';
import type { ShowTypes } from 'src/features/applicationMetadata';
export const DefaultComponent = () => {
  const applicationMetadata = useApplicationMetadata();
  const show: ShowTypes = applicationMetadata.onEntry?.show ?? 'new-instance';

  if (show === 'select-instance') {
    return (
      <Navigate
        to={'/instance-selection/'}
        replace={true}
      />
    );
  }

  return <InstantiateContainer />;
};

export const App = () => (
  <Routes>
    <Route
      path='/'
      element={<Entrypoint />}
    >
      <Route
        path='/instance-selection/*'
        element={<InstanceSelectionWrapper />}
      />
      <Route
        path='/party-selection/*'
        element={<PartySelection />}
      />
      <Route
        path='/instance/:partyId/:instanceGuid/*'
        element={
          <InstanceProvider>
            <ProcessWrapperWrapper />
          </InstanceProvider>
        }
      />

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

      <Route
        path='*'
        element={<DefaultComponent />}
      />
    </Route>
  </Routes>
);
