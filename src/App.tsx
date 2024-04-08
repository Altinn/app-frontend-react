import React from 'react';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';

import { ProcessWrapperWrapper } from 'src/components/wrappers/ProcessWrapper';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { InstantiateContainer } from 'src/features/instantiate/containers/InstantiateContainer';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { InstanceSelectionWrapper } from 'src/features/instantiate/selection/InstanceSelection';
import { useCurrentParty, useCurrentPartyIsValid, useParties } from 'src/features/party/PartiesProvider';
import type { ShowTypes } from 'src/features/applicationMetadata';
export const DefaultComponent = () => {
  const applicationMetadata = useApplicationMetadata();
  const show: ShowTypes = applicationMetadata.onEntry?.show ?? 'new-instance';
  console.log('show', show);
  if (show === 'select-instance') {
    return (
      <Navigate
        to={'/instance-selection/'}
        replace={true}
      />
    );
  }

  console.log('InstantiateContainer');

  return <InstantiateContainer />;
};

export const ProtectedRoute = () => {
  const navigate = useNavigate();

  const party = useCurrentParty();
  const partyIsValid = useCurrentPartyIsValid();

  //  const validParties = usePartiesCtx() as IParty[];

  const parties = useParties();

  const applicationMetadata = useApplicationMetadata();

  // parties.

  // const usersValidParties = parties.filter((party) => party.partyTypeName)

  //applicationMetadata.partyTypesAllowed.person

  // const { partyTypesAllowed } = appMetadata || {};

  // if (!isAuthenticated) {
  //   navigate('/sign-in');
  // }

  console.log('partyIsValid', partyIsValid);

  if (!partyIsValid) {
    <Navigate
      to={'/party-selection'}
      replace={true}
    />;
  }
  return <Outlet />;
};

export const App = () => (
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route
        path='/'
        element={<DefaultComponent />}
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
        element={<ProtectedRoute />}
      />
    </Route>
  </Routes>
);
