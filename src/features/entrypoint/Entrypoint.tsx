import React from 'react';
import { Navigate } from 'react-router-dom';

import { Form } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useIsStatelessApp } from 'src/features/applicationMetadata/appMetadataUtils';
import { FormProvider } from 'src/features/form/FormContext';
import { InstantiateContainer } from 'src/features/instantiate/containers/InstantiateContainer';
import { Loader } from 'src/features/loading/Loader';
import { ValidPartyProvider } from 'src/features/party/ValidPartyProvider';
import { ValidationActions } from 'src/features/validation/validationSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import { PresentationType } from 'src/types';
import type { ShowTypes } from 'src/features/applicationMetadata';

export function Entrypoint() {
  const applicationMetadata = useApplicationMetadata();
  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);
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
      <ValidPartyProvider>
        <Navigate
          to={'/instance-selection/'}
          replace={true}
        />
      </ValidPartyProvider>
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
