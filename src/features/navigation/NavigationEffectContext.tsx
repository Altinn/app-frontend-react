import React from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';

export type NavigationEffectCb = () => void;

interface Context {
  effectCallback: NavigationEffectCb | null;
  setEffectCallback: (cb: NavigationEffectCb | null) => void;
}

const { useCtx, Provider } = createContext<Context>({
  name: 'NavigationEffect',
  required: true,
});

export function NavigationEffectProvider({ children }: PropsWithChildren) {
  const [effectCallback, setEffectCallback] = React.useState<NavigationEffectCb | null>(null);
  return <Provider value={{ effectCallback, setEffectCallback }}>{children}</Provider>;
}
export const useNavigationEffect = () => useCtx().effectCallback;
export const useSetNavigationEffect = () => useCtx().setEffectCallback;
