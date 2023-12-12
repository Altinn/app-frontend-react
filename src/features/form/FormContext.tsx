import React from 'react';

import { AttachmentsProvider } from 'src/features/attachments/AttachmentsContext';
import { CustomValidationConfigProvider } from 'src/features/customValidation/CustomValidationContext';
import { DataModelSchemaProvider } from 'src/features/datamodel/DataModelSchemaProvider';
import { DynamicsProvider } from 'src/features/form/dynamics/DynamicsContext';
import { LayoutsProvider } from 'src/features/form/layout/LayoutsContext';
import { UiConfigProvider } from 'src/features/form/layout/UiConfigContext';
import { LayoutSettingsProvider } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { RulesProvider } from 'src/features/form/rules/RulesContext';
import { FormDataReadWriteProvider } from 'src/features/formData/FormDataReadWrite';
import { useHasProcessProvider } from 'src/features/instance/ProcessContext';
import { ProcessNavigationProvider } from 'src/features/instance/ProcessNavigationContext';
import { AllOptionsProvider } from 'src/features/options/useAllOptions';
import { NodesProvider } from 'src/utils/layout/NodesContext';

/**
 * This helper-context provider is used to provide all the contexts needed for forms to work
 */
export function FormProvider({ children }: React.PropsWithChildren) {
  const hasProcess = useHasProcessProvider();

  return (
    <CustomValidationConfigProvider>
      <LayoutsProvider>
        <LayoutSettingsProvider>
          <UiConfigProvider>
            <FormDataReadWriteProvider>
              <DataModelSchemaProvider>
                <AttachmentsProvider>
                  <DynamicsProvider>
                    <RulesProvider>
                      <NodesProvider>
                        <AllOptionsProvider>
                          {hasProcess ? <ProcessNavigationProvider>{children}</ProcessNavigationProvider> : children}
                        </AllOptionsProvider>
                      </NodesProvider>
                    </RulesProvider>
                  </DynamicsProvider>
                </AttachmentsProvider>
              </DataModelSchemaProvider>
            </FormDataReadWriteProvider>
          </UiConfigProvider>
        </LayoutSettingsProvider>
      </LayoutsProvider>
    </CustomValidationConfigProvider>
  );
}
