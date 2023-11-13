import { createSelector } from 'reselect';

import type { IRuntimeState } from 'src/types';

/**
 * Selector for determining if we have an error in one of our api calls.
 * Returns true any errors is set in relevant states, false otherwise
 * @param state the redux state
 */
const getHasErrorsSelector = (state: IRuntimeState) => {
  const exceptIfIncludes = (maybeError: Error | null, lookFor: string): Error | null => {
    if (maybeError && maybeError.message?.includes(lookFor)) {
      return null;
    }

    return maybeError;
  };

  // PRIORITY: Fix this in Entrypoint.tsx or somewhere else instead
  const error =
    // 403 in formData is handled with MissingRolesError, see Entrypoint.tsx
    exceptIfIncludes(state.formData.error, '403');

  return error !== null;
};

const getHasErrors = () => createSelector([getHasErrorsSelector], (hasErrors: boolean) => hasErrors);

export const makeGetHasErrorsSelector = getHasErrors;
