import React from 'react';

import { FormDataProvider, NewFD } from 'src/features/formData2/FormDataContext';
import { UseNewFormDataHook } from 'src/features/toggles';
import { useAppSelector } from 'src/hooks/useAppSelector';
import type { IFormData } from 'src/features/formData';
import type { IFormDataFunctionality, IFormDataMethods } from 'src/features/formData2/types';
import type { IRuntimeState } from 'src/types';

export function SagaFetchFormDataCompat(state: IRuntimeState): IFormData {
  if (UseNewFormDataHook) {
    return window.deprecated.currentFormData;
  }

  return state.formData.formData;
}

export function FormDataLegacyProvider({ children }) {
  window.deprecated = window.deprecated || {};
  window.deprecated.currentFormData = useAppSelector((state) => state.formData.formData);

  return children;
}

function InnerCompatibilityProvider({ children }) {
  window.deprecated = window.deprecated || {};
  window.deprecated.currentFormData = NewFD.useAsDotMap();

  return children;
}

export function FormDataNewProvider({ children }) {
  return (
    <FormDataProvider>
      <InnerCompatibilityProvider>{children}</InnerCompatibilityProvider>
    </FormDataProvider>
  );
}

function useAsDotMap() {
  return useAppSelector((state) => state.formData.formData);
}

function useMethods(): IFormDataMethods {
  // const dispatch = useAppDispatch();

  return {
    setLeafValue: (_path, _value) => {
      // TODO: Implement
      alert('TODO: Implement legacy setLeafValue');
    },
  };
}

const CompatibilityFD: IFormDataFunctionality = {
  useAsDotMap,
  useMethods,
};

export const FD: IFormDataFunctionality = UseNewFormDataHook ? NewFD : CompatibilityFD;
