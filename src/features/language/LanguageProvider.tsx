import React, { useState } from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';

interface LanguageCtx {
  current: string;
  setCurrent: (language: string) => void;
}

const { Provider, useCtx } = createContext<LanguageCtx>({
  name: 'Language',
  required: true,
});

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [current, setCurrent] = useState('nb');

  // PRIORITY: This should take over from the currently selected language stored in the legacy 'profile' redux slice

  return <Provider value={{ current, setCurrent }}>{children}</Provider>;
};

export const useCurrentLanguage = () => useCtx().current;
export const useSetCurrentLanguage = () => useCtx().setCurrent;
