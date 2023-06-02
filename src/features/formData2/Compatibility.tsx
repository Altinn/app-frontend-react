import React from 'react';

import { FormDataProvider, NewFD } from 'src/features/formData2/FormDataContext';
import { UseNewFormDataHook } from 'src/features/toggles';
import { useAppSelector } from 'src/hooks/useAppSelector';
import type { IFormDataFunctionality } from 'src/features/formData2/types';

function FormDataLegacyProvider({ children }) {
  window.deprecated = window.deprecated || {};
  window.deprecated.currentFormData = useAppSelector((state) => state.formData.formData);

  return children;
}

function FormDataNewProvider({ children }) {
  window.deprecated = window.deprecated || {};
  window.deprecated.currentFormData = NewFD.useAsDotMap();

  return <FormDataProvider>{children}</FormDataProvider>;
}

export function FormDataCompatProvider({ children }) {
  if (UseNewFormDataHook) {
    return <FormDataNewProvider>{children}</FormDataNewProvider>;
  }

  return <FormDataLegacyProvider>{children}</FormDataLegacyProvider>;
}

function useAsDotMap() {
  return useAppSelector((state) => state.formData.formData);
}

const CompatibilityFD: IFormDataFunctionality = {
  useAsDotMap,
};

export const FD: IFormDataFunctionality = UseNewFormDataHook ? NewFD : CompatibilityFD;
