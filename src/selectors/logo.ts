import { createSelector } from 'reselect';

import {
  getAppLogoAltText,
  getAppLogoUrl,
  getdisplayAppOwnerNameInHeader,
  getUseAppLogoOrgSource,
} from 'src/language/sharedLanguage';
import { selectLangTools, selectOrg } from 'src/selectors/language';
import { appMetaDataSelector, selectAllOrgs } from 'src/selectors/simpleSelectors';

export const selectUseAppLogoOrgSource = createSelector(appMetaDataSelector, getUseAppLogoOrgSource);
export const selectdisplayAppOwnerNameInHeader = createSelector(appMetaDataSelector, getdisplayAppOwnerNameInHeader);
export const selectAppLogoAltText = createSelector(selectAllOrgs, selectOrg, selectLangTools, getAppLogoAltText);
export const selectAppLogoUrl = createSelector(
  selectAllOrgs,
  selectOrg,
  selectLangTools,
  selectUseAppLogoOrgSource,
  getAppLogoUrl,
);
