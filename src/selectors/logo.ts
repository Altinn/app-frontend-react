import { createSelector } from 'reselect';

import {
  getAppLogoAltText,
  getAppLogoUrl,
  getShowAppOwnerInHeader,
  getUseAppLogoOrgSource,
} from 'src/language/sharedLanguage';
import { selectLangTools, selectOrg } from 'src/selectors/language';
import { appMetaDataSelector, selectAllOrgs } from 'src/selectors/simpleSelectors';

export const selectUseAppLogoOrgSource = createSelector(appMetaDataSelector, getUseAppLogoOrgSource);
export const selectShowAppOwnerInHeader = createSelector(appMetaDataSelector, getShowAppOwnerInHeader);
export const selectAppLogoAltText = createSelector(selectAllOrgs, selectOrg, selectLangTools, getAppLogoAltText);
export const selectAppLogoUrl = createSelector(
  selectAllOrgs,
  selectOrg,
  selectLangTools,
  selectUseAppLogoOrgSource,
  getAppLogoUrl,
);
