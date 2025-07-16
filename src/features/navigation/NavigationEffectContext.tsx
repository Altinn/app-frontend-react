import React from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';

export type NavigationEffectCb = () => void;

interface Context {
  effect: {
    targetLocation: string;
    callback: NavigationEffectCb;
  } | null;
  setEffect: (effect: Context['effect']) => void;
}

const { useCtx, Provider } = createContext<Context>({
  name: 'NavigationEffect',
  required: true,
});

export function NavigationEffectProvider({ children }: PropsWithChildren) {
  const [effect, setEffect] = React.useState<Context['effect']>(null);
  return <Provider value={{ effect, setEffect }}>{children}</Provider>;
}
export const useNavigationEffect = () => useCtx().effect;
export const useSetNavigationEffect = () => useCtx().setEffect;
