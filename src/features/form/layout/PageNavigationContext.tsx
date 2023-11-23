import React, { useState } from 'react';

import { createStrictContext } from 'src/utils/createContext';

export type PageNavigationContext = {
  focusId?: string;
  returnToView?: string;
  setFocusId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setReturnToView: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const { Provider, useCtx } = createStrictContext<PageNavigationContext>({ name: 'PageNavigationContext' });

export function PageNavigationProvider({ children }: React.PropsWithChildren) {
  const [focusId, setFocusId] = useState<string>();
  const [returnToView, setReturnToView] = useState<string>();

  return <Provider value={{ focusId, setFocusId, returnToView, setReturnToView }}>{children}</Provider>;
}

export const usePageNavigationContext = () => useCtx();
