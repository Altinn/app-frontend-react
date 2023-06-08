import React, { useMemo } from 'react';

import dot from 'dot-object';

import { FormDataProvider, NewFD } from 'src/features/formData2/FormDataContext';
import { UseNewFormDataHook } from 'src/features/toggles';
import { useAppSelector } from 'src/hooks/useAppSelector';
import type { IFormData } from 'src/features/formData';
import type { IFormDataFunctionality } from 'src/features/formData2/types';
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

const CompatibilityFD: IFormDataFunctionality = {
  useAsDotMap: () => useAppSelector((state) => state.formData.formData),
  useAsObject: () => {
    const formData = useAppSelector((state) => state.formData.formData);
    return useMemo(() => dot.object(structuredClone(formData || {})), [formData]);
  },
  usePick: (path) => {
    const formData = useAppSelector((state) => state.formData.formData);
    const asObject = useMemo(() => dot.object(structuredClone(formData || {})), [formData]);
    return path ? dot.pick(path, asObject) : undefined;
  },
  useBindings: (bindings) => {
    const formData = useAppSelector((state) => state.formData.formData);
    const asObject = useMemo(() => dot.object(structuredClone(formData || {})), [formData]);
    const output: any = {};
    if (bindings) {
      for (const binding of Object.keys(bindings)) {
        output[binding] = dot.pick(bindings[binding], asObject);
      }
    }

    return output;
  },
  useMethods: () => ({
    setLeafValue: (_path, _value) => {
      // TODO: Implement
      alert('TODO: Implement legacy setLeafValue');
    },
  }),
};

export const FD: IFormDataFunctionality = UseNewFormDataHook ? NewFD : CompatibilityFD;
