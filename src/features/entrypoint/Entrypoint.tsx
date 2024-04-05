import React from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { Form, FormFirstPage } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/presentation/Presentation';
import { LayoutValidationProvider } from 'src/features/devtools/layoutValidation/useLayoutValidation';
import { FormProvider } from 'src/features/form/FormContext';
import { useCurrentParty, useCurrentPartyIsValid } from 'src/features/party/PartiesProvider';
import { useAllowAnonymousIs } from 'src/features/stateless/getAllowAnonymous';
import { usePromptForParty } from 'src/hooks/usePromptForParty';
import { PresentationType } from 'src/types';
import { useIsStatelessApp } from 'src/utils/useIsStatelessApp';

export function Entrypoint() {
  const isStateless = useIsStatelessApp();
  const party = useCurrentParty();
  const partyIsValid = useCurrentPartyIsValid();
  const allowAnonymous = useAllowAnonymousIs(true);
  const alwaysPromptForParty = usePromptForParty();

  const location = useLocation();

  const isMissingParty = party === undefined && !allowAnonymous;

  if (alwaysPromptForParty) {
    return (
      <Navigate
        to={`/party-selection`}
        replace={true}
      />
    );
  }

  if (!partyIsValid || isMissingParty) {
    if (location.pathname.includes('party-selection')) {
      return <Outlet />;
    }

    return (
      <Navigate
        to={`/party-selection/403`}
        replace={true}
      />
    );
  }

  // Stateless view
  if (isStateless) {
    return (
      <FormProvider>
        <LayoutValidationProvider>
          <Routes>
            <Route
              path=':pageKey'
              element={
                <PresentationComponent type={PresentationType.Stateless}>
                  <Form />
                </PresentationComponent>
              }
            />
            <Route
              path='*'
              element={<FormFirstPage />}
            />
          </Routes>
        </LayoutValidationProvider>
      </FormProvider>
    );
  }

  return <Outlet />;
}
