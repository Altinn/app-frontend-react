import React, { useEffect, useMemo, useState } from 'react';

import { preProcessItem } from 'src/features/expressions/validation';
import { usePageNavigationContext } from 'src/features/form/layout/PageNavigationContext';
import { useLayoutSettingsQueryWithoutSideEffects } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { createStrictContext } from 'src/utils/createContext';
import type { ExprObjConfig, ExprVal } from 'src/features/expressions/types';
import type { IHiddenLayoutsExternal, ILayoutSettings } from 'src/types';

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

  /**
   * Keeps track of the order of the pages before hidden pages are removed.
   */
  orderWithHidden: string[];
};

const { Provider, useCtx } = createStrictContext<UiConfigContext>({ name: 'UiConfigContext' });

const config: ExprObjConfig<{ hidden: ExprVal.Boolean; whatever: string }> = {
  hidden: {
    returnType: 'test',
    defaultValue: false,
    resolvePerRow: false,
  },
};

export function UiConfigProvider({ children }: React.PropsWithChildren) {
  const { data, isFetching, error } = useLayoutSettingsQueryWithoutSideEffects();
  const [expandedWidth, setExpandedWidth] = useState<boolean>(false);
  const { setHiddenExpr } = usePageNavigationContext();

  const hiddenLayoutsExpressions: IHiddenLayoutsExternal = useMemo(() => {
    const _data: ILayoutSettings = data || { pages: { order: [] } };
    return Object.keys(_data).reduce(
      (acc, key) => ({
        ...acc,
        [key]: _data[key].data?.hidden,
      }),
      {},
    );
  }, [data]);

  const _hidden: IHiddenLayoutsExternal = useMemo(
    () =>
      Object.keys(hiddenLayoutsExpressions).reduce(
        (acc, key) => ({
          ...acc,
          [key]: preProcessItem(hiddenLayoutsExpressions[key], config, ['hidden'], key),
        }),
        {},
      ),
    [hiddenLayoutsExpressions],
  );

  useEffect(() => {
    setHiddenExpr(_hidden);
  }, [setHiddenExpr, _hidden]);

  if (error) {
    return <UnknownError />;
  }

  if (!data || isFetching) {
    return <div>Loading</div>;
  }

  return (
    <Provider
      value={{
        hideCloseButton: data.pages.hideCloseButton,
        showLanguageSelector: data.pages.showLanguageSelector,
        showExpandWidthButton: data.pages.showExpandWidthButton,
        showProgress: data.pages.showProgress,
        expandedWidth,
        orderWithHidden: data.pages.order,
        toggleExpandedWidth: () => setExpandedWidth((prevState) => !prevState),
      }}
    >
      {children}
    </Provider>
  );
}

export const useUiConfigContext = () => useCtx();
