import React, { useState } from 'react';

import { useLayoutSetId } from 'src/features/form/layout/LayoutsContext';
import { useLayoutSettingsQueryWithoutSideEffects } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { createStrictContext } from 'src/utils/createContext';

export type UiConfigContext = {
  hideCloseButton?: boolean;
  showLanguageSelector?: boolean;
  showExpandWidthButton?: boolean;
  showProgress?: boolean;

  /**
   * Keeps track of whether the UI is expanded or not.
   */
  expandedWidth?: boolean;
  toggleExpandedWidth?: () => void;
};

const { Provider, useCtx } = createStrictContext<UiConfigContext>({ name: 'UiConfigContext' });

export function UiConfigProvider({ children }: React.PropsWithChildren) {
  const layoutSetId = useLayoutSetId();
  const layoutSettings = useLayoutSettingsQueryWithoutSideEffects(layoutSetId);

  const [expandedWidth, setExpandedWidth] = useState<boolean>(false);

  return (
    <Provider
      value={{
        hideCloseButton: layoutSettings?.data?.pages?.hideCloseButton,
        showLanguageSelector: layoutSettings?.data?.pages?.showLanguageSelector,
        showExpandWidthButton: layoutSettings?.data?.pages?.showExpandWidthButton,
        showProgress: layoutSettings?.data?.pages?.showProgress,
        expandedWidth,
        toggleExpandedWidth: () => setExpandedWidth((prevState) => !prevState),
      }}
    >
      {children}
    </Provider>
  );
}

export const useUiConfigContext = () => useCtx();
