import { createSelector } from 'reselect';

import type { IRuntimeState } from 'src/types';

/**
 * Selector for determining if we have an error in one of our api calls.
 * Returns true any errors is set in relevant states, false otherwise
 * @param state the redux state
 */
const getHasErrorsSelector = (state: IRuntimeState) => {
  const error =
    state.party.error ||
    state.process.error ||
    state.profile.error ||
    state.formLayout.error ||
    state.footerLayout.error ||
    state.instanceData.error ||
    state.applicationMetadata.error ||
    state.formDataModel.error ||
    state.optionState.error ||
    state.attachments.error ||
    state.dataListState.error ||
    state.pdf.error ||
    state.applicationSettings.error ||
    state.textResources.error ||
    state.formDynamics.error ||
    state.formRules.error;

  return error !== null;
};

const getHasErrors = () => createSelector([getHasErrorsSelector], (hasErrors: boolean) => hasErrors);

export const makeGetHasErrorsSelector = getHasErrors;
