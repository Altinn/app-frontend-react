import React, { useState } from 'react';

import { createStrictContext } from 'src/utils/createContext';
import type { IComponentScrollPos } from 'src/features/form/layout/formLayoutTypes';
import type { IHiddenLayoutsExternal } from 'src/types';

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

  /**
   * Keeps track of which pages are hidden by expressions.
   */
  hidden: string[];
  setHiddenPages: React.Dispatch<React.SetStateAction<string[]>>;
  /**
   * Keeps track of the hidden expressions for each page.
   */
  hiddenExpr: IHiddenLayoutsExternal;
  setHiddenExpr: React.Dispatch<React.SetStateAction<IHiddenLayoutsExternal>>;
};

const { Provider, useCtx } = createStrictContext<PageNavigationContext>({ name: 'PageNavigationContext' });

export function PageNavigationProvider({ children }: React.PropsWithChildren) {
  const [focusId, setFocusId] = useState<string>();
  const [returnToView, setReturnToView] = useState<string>();
  const [scrollPosition, setScrollPosition] = useState<IComponentScrollPos | undefined>();
  const [hidden, setHidden] = useState<string[]>([]);
  const [hiddenExpr, setHiddenExpr] = useState<IHiddenLayoutsExternal>({});

  return (
    <Provider
      value={{
        focusId,
        setFocusId,
        returnToView,
        setReturnToView,
        scrollPosition,
        setScrollPosition,
        hidden,
        setHiddenPages: setHidden,
        setHiddenExpr,
        hiddenExpr,
      }}
    >
      {children}
    </Provider>
  );
}

export const usePageNavigationContext = () => useCtx();
