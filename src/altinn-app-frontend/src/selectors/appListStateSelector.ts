import type { IRuntimeState } from 'src/types';

const appListStateSelector = (state: IRuntimeState) => state.appListState;

export const listStateSelector = (state: IRuntimeState) => {
  const appListState = appListStateSelector(state);

  return appListState || {};
};
