import React, { createContext, useContext } from 'react';

import dot from 'dot-object';

import type { IFormData } from 'src/features/formData';
import type { FormDataStorage, IFormDataFunctionality } from 'src/features/formData2/types';

const FormDataContext = createContext<FormDataStorage>({
  currentData: {},
  lastSavedData: {},
  saving: false,
  unsavedChanges: false,
});

function useFormData() {
  return useContext(FormDataContext);
}

export function FormDataProvider({ children }) {
  return (
    <FormDataContext.Provider
      value={{
        currentData: {},
        lastSavedData: {},
        saving: false,
        unsavedChanges: false,
      }}
    >
      {children}
    </FormDataContext.Provider>
  );
}

/**
 * Returns the current form data, as a dot map. The dot map is a flat object where the keys are the
 * dot-separated paths to the values. No objects exist here, just leaf values.
 */
function useAsDotMap(): IFormData {
  const { currentData } = useFormData();
  return dot.dot(currentData);
}

export const NewFD: IFormDataFunctionality = {
  useAsDotMap,
};
