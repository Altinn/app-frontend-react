import type { IRuntimeState } from 'src/types';

const selectedSortColumnStateSelector = (state: IRuntimeState) => state.appListState.sortColumn;

export const appListSortColumnSelector = (state: IRuntimeState) => {
  const selectedSortColumn = selectedSortColumnStateSelector(state);
  return selectedSortColumn || null;
};
