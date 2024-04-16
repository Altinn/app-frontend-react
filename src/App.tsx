import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ProcessWrapperWrapper } from 'src/components/wrappers/ProcessWrapper';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { InstantiateContainer } from 'src/features/instantiate/containers/InstantiateContainer';
import { NoValidPartiesError } from 'src/features/instantiate/containers/NoValidPartiesError';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { InstanceSelectionWrapper } from 'src/features/instantiate/selection/InstanceSelection';
import { useCurrentParty, useCurrentPartyIsValid, useValidParties } from 'src/features/party/PartiesProvider';
import { useProfile } from 'src/features/profile/ProfileProvider';
import type { ShowTypes } from 'src/features/applicationMetadata';

const ShowOrInstantiate: React.FC<{ show: ShowTypes }> = ({ show }) => {
  if (show === 'select-instance') {
    return (
      <Navigate
        to={'/instance-selection'}
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

export const DefaultComponent = () => {
  const applicationMetadata = useApplicationMetadata();
  const show: ShowTypes = applicationMetadata.onEntry?.show ?? 'new-instance';
  const validParties = useValidParties();
  const profile = useProfile();
  const currentParty = useCurrentParty();
  const partyIsValid = useCurrentPartyIsValid();
  if (!partyIsValid) {
    return (
      <Navigate
        to={'/party-selection/403'}
        replace={true}
      />
    );
  }

  if (!validParties?.length) {
    return <NoValidPartiesError />;
  }

  if (validParties?.length === 1) {
    return <ShowOrInstantiate show={show} />;
  }

  if (validParties?.length && validParties?.length > 1) {
    console.log('more than one valid party');

    if (applicationMetadata.promptForParty === 'always') {
      console.log('ARE WE GETTING HERE?????');

      console.log('promptForParty always');
      return (
        <Navigate
          to={'/party-selection/explained'}
          replace={true}
        />
      );
    }

    if (applicationMetadata.promptForParty === 'never') {
      console.log('promptForParty never');
      return <ShowOrInstantiate show={show} />;
    }

    if (profile?.profileSettingPreference.doNotPromptForParty) {
      console.log('doNotPromptForParty = true');
      return <ShowOrInstantiate show={show} />;
    }
    console.log('doNotPromptForParty = false');
    return (
      <Navigate
        to={'/party-selection/explained'}
        replace={true}
      />
    );
  }
  return <UnknownError />;
};

export const App = () => (
  <Routes>
    <Route
      path={'/'}
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

    <Route
      path='*'
      element={<UnknownError />}
    />
  </Routes>
);
