import { SortDirection } from '@altinn/altinn-design-system';

import type { IRuntimeState } from 'src/types';

const selectedSortDirectionStateSelector = (state: IRuntimeState) => state.appListState.sortDirection;

export const appListSortDirectionSelector = (state: IRuntimeState) => {
  const selectedSortDirection = selectedSortDirectionStateSelector(state);
  return selectedSortDirection || SortDirection.NotActive;
};
