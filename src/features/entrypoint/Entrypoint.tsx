import React from 'react';
import { Navigate } from 'react-router-dom';

import { Form } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import { Loader } from 'src/core/loading/Loader';
import { useAppName, useAppOwner } from 'src/core/texts/appTexts';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useIsStatelessApp } from 'src/features/applicationMetadata/appMetadataUtils';
import { FormProvider } from 'src/features/form/FormContext';
import { InstantiateContainer } from 'src/features/instantiate/containers/InstantiateContainer';
import { ValidPartyProvider } from 'src/features/party/ValidPartyProvider';
import { ValidationActions } from 'src/features/validation/validationSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { PresentationType } from 'src/types';
import type { ShowTypes } from 'src/features/applicationMetadata';

export function Entrypoint() {
  const applicationMetadata = useApplicationMetadata();
  const appName = useAppName();
  const appOwner = useAppOwner();
  const dispatch = useAppDispatch();
  const isStateless = useIsStatelessApp();
  const show: ShowTypes = applicationMetadata.onEntry?.show ?? 'new-instance';

  React.useEffect(() => {
    // If user comes back to entrypoint from an active instance we need to clear validation messages
    dispatch(ValidationActions.updateValidations({ validationResult: { validations: {} }, merge: false }));
  }, [dispatch]);

  // PRIORITY: We should always prompt for party, if that setting is enabled in the app.

  if (show === 'new-instance') {
    return (
      <ValidPartyProvider>
        <InstantiateContainer />;
      </ValidPartyProvider>
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

  // Stateless view
  if (isStateless) {
    return (
      <FormProvider>
        <PresentationComponent
          header={appName || ''}
          appOwner={appOwner}
          type={PresentationType.Stateless}
        >
          <Form />
        </PresentationComponent>
      </FormProvider>
    );
  }

  return (
    <FormProvider>
      <Loader reason='entrypoint' />
    </FormProvider>
  );
}
