import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { ProcessWrapperWrapper } from 'src/components/wrappers/ProcessWrapper';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { InstantiateContainer } from 'src/features/instantiate/containers/InstantiateContainer';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { InstanceSelectionWrapper } from 'src/features/instantiate/selection/InstanceSelection';
import { useCurrentPartyIsValid, useValidParties } from 'src/features/party/PartiesProvider';
import { useProfile } from 'src/features/profile/ProfileProvider';
import { usePromptForParty } from 'src/hooks/usePromptForParty';
import type { ShowTypes } from 'src/features/applicationMetadata';
export const DefaultComponent = () => {
  const applicationMetadata = useApplicationMetadata();
  const show: ShowTypes = applicationMetadata.onEntry?.show ?? 'new-instance';
  const validParties = useValidParties();
  const profile = useProfile();
  const partyIsValid = useCurrentPartyIsValid();
  const alwaysPromptForParty = usePromptForParty();

  if (!partyIsValid) {
    return (
      <Navigate
        to={'/party-selection/403'}
        replace={true}
      />
    );
  }

  if (alwaysPromptForParty) {
    return (
      <Navigate
        to={'/party-selection/explained'}
        replace={true}
      />
    );
  }

  if (validParties?.length && validParties?.length > 1 && !profile?.profileSettingPreference.doNotPromptForParty) {
    return (
      <Navigate
        to={'/party-selection/explained'}
        replace={true}
      />
    );
  }

  if (show === 'select-instance') {
    return (
      <Navigate
        to={'/instance-selection/'}
        replace={true}
      />
    );
  }

  if (show === 'new-instance') {
    return <InstantiateContainer />;
  }

  window.logErrorOnce('Unknown applicationMetadata.onEntry type:', show);
  return <UnknownError />;
};
export const ProtectedRoute: React.FC<PropsWithChildren> = ({ children }) => {
  const partyIsValid = useCurrentPartyIsValid();
  if (!partyIsValid) {
    return (
      <Navigate
        to={'/party-selection/403'}
        replace={true}
      />
    );
  }
  return children;
};

export const App = () => (
  <Routes>
    <Route
      path={'/'}
      element={<DefaultComponent />}
    />
    <Route
      path='/instance-selection/*'
      element={
        <ProtectedRoute>
          <InstanceSelectionWrapper />
        </ProtectedRoute>
      }
    />

    <Route
      path='/party-selection/*'
      element={<PartySelection />}
    />

    <Route
      path='/instance/:partyId/:instanceGuid/*'
      element={
        <ProtectedRoute>
          <InstanceProvider>
            <ProcessWrapperWrapper />
          </InstanceProvider>
        </ProtectedRoute>
      }
    />

    <Route
      path='*'
      element={<UnknownError />}
    />
  </Routes>
);
