import React from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { ProcessWrapperWrapper } from 'src/components/wrappers/ProcessWrapper';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { InstantiateContainer } from 'src/features/instantiate/containers/InstantiateContainer';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { InstanceSelectionWrapper } from 'src/features/instantiate/selection/InstanceSelection';
import { useCurrentPartyIsValid, useValidParties } from 'src/features/party/PartiesProvider';
import { useProfile } from 'src/features/profile/ProfileProvider';
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
  const partyIsValid = useCurrentPartyIsValid();

  const validParties = useValidParties();

  const profile = useProfile();

  // profile.profileSettingPreference.doNotPromptForParty

  console.log(JSON.stringify(validParties, null, 2));

  const location = useLocation();
  if (!partyIsValid && !location.pathname.includes('party-selection')) {
    console.log('ARE WE ALSO ENDING UP HERE?????');
    return (
      <Navigate
        to={'/party-selection'}
        replace={true}
      />
    );
  }

  console.log(
    'profile?.profileSettingPreference.doNotPromptForParty',
    profile?.profileSettingPreference.doNotPromptForParty,
  );

  console.log('partyIsValid', partyIsValid);
  if (validParties?.length && validParties?.length > 1 && !profile?.profileSettingPreference.doNotPromptForParty) {
    console.log('We should end up here!!');
    return (
      <Navigate
        to={'/party-selection/403'}
        replace={true}
      />
    );
  }

  return <Outlet />;
};

export const App = () => (
  <Routes>
    <Route
      path={'/'}
      element={<DefaultComponent />}
    />

    <Route
      path='/*'
      element={<ProtectedRoute />}
    >
      <Route
        path='instance-selection/*'
        element={<InstanceSelectionWrapper />}
      />
      <Route
        path='party-selection/*'
        element={<PartySelection />}
      />
      <Route
        path='instance/:partyId/:instanceGuid/*'
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
        path='partyselection/*'
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
