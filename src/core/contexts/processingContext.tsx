import React, { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

import { useIsProcessing } from 'src/hooks/useIsProcessing';

const Context = createContext<ReturnType<typeof useIsProcessing<string>>>([
  null,
  () => {
    throw new Error('useProcessingContext was used without a matching provider');
  },
]);

export function ProcessingProvider({ children }: PropsWithChildren) {
  const value = useIsProcessing<string>();

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useProcessingContext = () => useContext(Context);
