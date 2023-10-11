import React from 'react';

import { DataModelSchemaProvider } from 'src/features/datamodel/DataModelSchemaProvider';
import { DynamicsProvider } from 'src/features/form/dynamics/DynamicsContext';
import { LayoutsProvider } from 'src/features/form/layout/LayoutsContext';
import { LayoutSettingsProvider } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { LayoutValidationProvider } from 'src/features/form/layoutValidation/useLayoutValidationCurrentPage';
import { RulesProvider } from 'src/features/form/rules/RulesContext';
import { FormDataProvider } from 'src/features/formData/FormDataContext';
import { AllOptionsProvider } from 'src/features/options/useAllOptions';
import { createStrictContext } from 'src/utils/createContext';

const { Provider } = createStrictContext();

/**
 * This helper-context provider is used to provide all the contexts needed for forms to work
 */
export function FormProvider({ children }: React.PropsWithChildren) {
  return (
    <Provider value={undefined}>
      <LayoutsProvider>
        <LayoutSettingsProvider>
          <FormDataProvider>
            <DataModelSchemaProvider>
              <DynamicsProvider>
                <RulesProvider>
                  <AllOptionsProvider>
                    <LayoutValidationProvider>{children}</LayoutValidationProvider>
                  </AllOptionsProvider>
                </RulesProvider>
              </DynamicsProvider>
            </DataModelSchemaProvider>
          </FormDataProvider>
        </LayoutSettingsProvider>
      </LayoutsProvider>
    </Provider>
  );
}
