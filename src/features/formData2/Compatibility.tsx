import React from 'react';

import { FormDataProvider, NewFD } from 'src/features/formData2/FormDataContext';
import { UseNewFormDataHook } from 'src/features/toggles';
import { useAppSelector } from 'src/hooks/useAppSelector';
import type { IFormDataFunctionality } from 'src/features/formData2/types';

export function FormDataCompatProvider({ children }) {
  if (UseNewFormDataHook) {
    return <FormDataProvider>{children}</FormDataProvider>;
  }

  return children;
}

function useAsDotMap() {
  return useAppSelector((state) => state.formData.formData);
}

const CompatibilityFD: IFormDataFunctionality = {
  useAsDotMap,
};

export const FD: IFormDataFunctionality = UseNewFormDataHook ? NewFD : CompatibilityFD;
