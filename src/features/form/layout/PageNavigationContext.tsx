import React, { useState } from 'react';

import { createStrictContext } from 'src/utils/createContext';
import type { IComponentScrollPos } from 'src/features/form/layout/formLayoutTypes';

export type PageNavigationContext = {
  /**
   * Keeps track of which component to focus when the user has navigated
   * with the summary component buttons.
   */
  focusId?: string;
  setFocusId: React.Dispatch<React.SetStateAction<string | undefined>>;

  /**
   * Keeps track of which view to return to when the user has navigated
   * with the summary component buttons.
   */
  returnToView?: string;
  setReturnToView: React.Dispatch<React.SetStateAction<string | undefined>>;

  /**
   * Keeps track of scroll position to be able toscroll the page to the
   * next-button when navigation is stopped by validation errors, and the
   * page height changes as a result of displaying those validation errors.
   */
  scrollPosition?: IComponentScrollPos | undefined;
  setScrollPosition: React.Dispatch<React.SetStateAction<IComponentScrollPos | undefined>>;
};

const { Provider, useCtx } = createStrictContext<PageNavigationContext>({ name: 'PageNavigationContext' });

export function PageNavigationProvider({ children }: React.PropsWithChildren) {
  const [focusId, setFocusId] = useState<string>();
  const [returnToView, setReturnToView] = useState<string>();
  const [scrollPosition, setScrollPosition] = useState<IComponentScrollPos | undefined>();

  return (
    <Provider value={{ focusId, setFocusId, returnToView, setReturnToView, scrollPosition, setScrollPosition }}>
      {children}
    </Provider>
  );
}

export const usePageNavigationContext = () => useCtx();
