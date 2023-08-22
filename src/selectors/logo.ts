import { createSelector } from 'reselect';

import {
  getAppLogoAltText,
  getAppLogoUrl,
  getShowAppOwnerInHeader,
  getUseAppLogoOrgSource,
} from 'src/language/sharedLanguage';
import { selectAllOrgs, selectApplicationMetadata, selectLangTools, selectOrg } from 'src/selectors/language';

export const selectUseAppLogoOrgSource = createSelector(selectApplicationMetadata, getUseAppLogoOrgSource);
export const selectShowAppOwnerInHeader = createSelector(selectApplicationMetadata, getShowAppOwnerInHeader);
export const selectAppLogoAltText = createSelector(selectAllOrgs, selectOrg, selectLangTools, getAppLogoAltText);
export const selectAppLogoUrl = createSelector(
  selectAllOrgs,
  selectOrg,
  selectLangTools,
  selectUseAppLogoOrgSource,
  getAppLogoUrl,
);
