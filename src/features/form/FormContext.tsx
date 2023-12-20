import React from 'react';

import { AttachmentsProvider, AttachmentsStoreProvider } from 'src/features/attachments/AttachmentsContext';
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
import { AllOptionsProvider, AllOptionsStoreProvider } from 'src/features/options/useAllOptions';
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
            <DynamicsProvider>
              <RulesProvider>
                <FormDataReadWriteProvider>
                  <DataModelSchemaProvider>
                    <AttachmentsStoreProvider>
                      <AllOptionsStoreProvider>
                        <NodesProvider>
                          <AttachmentsProvider>
                            <AllOptionsProvider>
                              {hasProcess ? (
                                <ProcessNavigationProvider>{children}</ProcessNavigationProvider>
                              ) : (
                                children
                              )}
                            </AllOptionsProvider>
                          </AttachmentsProvider>
                        </NodesProvider>
                      </AllOptionsStoreProvider>{' '}
                    </AttachmentsStoreProvider>
                  </DataModelSchemaProvider>
                </FormDataReadWriteProvider>
              </RulesProvider>
            </DynamicsProvider>
          </UiConfigProvider>
        </LayoutSettingsProvider>
      </LayoutsProvider>
    </CustomValidationConfigProvider>
  );
}
