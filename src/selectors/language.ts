import { createSelector } from 'reselect';

import { staticUseLanguageFromState } from 'src/hooks/useLanguage';
import { getAppName, getAppOwner, getAppReceiver } from 'src/language/sharedLanguage';
import { appMetaDataSelector, selectAllOrgs } from 'src/selectors/simpleSelectors';
import type { IRuntimeState } from 'src/types';

export const selectOrg = (state: IRuntimeState) => state.applicationMetadata.applicationMetadata?.org;
export const selectLangTools = (state: IRuntimeState) => staticUseLanguageFromState(state);

export const selectAppName = createSelector(appMetaDataSelector, selectLangTools, getAppName);
export const selectAppOwner = createSelector(selectAllOrgs, selectOrg, selectLangTools, getAppOwner);
export const selectAppReceiver = createSelector(selectAllOrgs, selectOrg, selectLangTools, getAppReceiver);
