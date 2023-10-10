import React from 'react';

import { DataModelSchemaProvider } from 'src/features/datamodel/DataModelSchemaProvider';
import { FormDataProvider } from 'src/features/formData/FormDataContext';
import { LayoutValidationProvider } from 'src/features/layoutValidation/useLayoutValidationCurrentPage';
import { AllOptionsProvider } from 'src/features/options/useAllOptions';
import { createStrictContext } from 'src/utils/createContext';

const { Provider } = createStrictContext();

/**
 * This helper-context provider is used to provide all the contexts needed for forms to work
 */
export function FormProvider({ children }: React.PropsWithChildren) {
  return (
    <Provider value={undefined}>
      <FormDataProvider>
        <DataModelSchemaProvider>
          <AllOptionsProvider>
            <LayoutValidationProvider>{children}</LayoutValidationProvider>
          </AllOptionsProvider>
        </DataModelSchemaProvider>
      </FormDataProvider>
    </Provider>
  );
}
