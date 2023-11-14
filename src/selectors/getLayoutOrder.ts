import { createSelector } from 'reselect';

import type { RootState } from 'src/redux/store';
import type { IPageOrderConfig } from 'src/types';

/**
 * Given the IPageOrderConfig state, this returns the final order for layouts
 */
export function getLayoutOrderFromPageOrderConfig(pageOrderConfig: IPageOrderConfig): string[] | null {
  if (pageOrderConfig.order === null) {
    return null;
  }

  const hiddenSet = new Set(pageOrderConfig.hidden);
  return [...pageOrderConfig.order].filter((layout) => !hiddenSet.has(layout));
}

export const selectPageOrderConfig = (state: RootState) => state.formLayout.uiConfig.pageOrderConfig;

export const selectLayoutOrder = createSelector(selectPageOrderConfig, getLayoutOrderFromPageOrderConfig);
