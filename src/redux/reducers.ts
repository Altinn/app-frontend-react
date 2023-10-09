import { combineReducers } from 'redux';

import { applicationMetadataSlice } from 'src/features/applicationMetadata/applicationMetadataSlice';
import { applicationSettingsSlice } from 'src/features/applicationSettings/applicationSettingsSlice';
import { attachmentSlice } from 'src/features/attachments/attachmentSlice';
import { dataListsSlice } from 'src/features/dataLists/dataListsSlice';
import { formDataModelSlice } from 'src/features/datamodel/datamodelSlice';
import { devToolsSlice } from 'src/features/devtools/data/devToolsSlice';
import { formDynamicsSlice } from 'src/features/dynamics/formDynamicsSlice';
import { footerLayoutSlice } from 'src/features/footer/data/footerLayoutSlice';
import { formDataSlice } from 'src/features/formData/formDataSlice';
import { formRulesSlice } from 'src/features/formRules/rulesSlice';
import { isLoadingSlice } from 'src/features/isLoading/isLoadingSlice';
import { formLayoutSlice } from 'src/features/layout/formLayoutSlice';
import { optionsSlice } from 'src/features/options/optionsSlice';
import { orgsSlice } from 'src/features/orgs/orgsSlice';
import { partySlice } from 'src/features/party/partySlice';
import { profileSlice } from 'src/features/profile/profileSlice';
import { queueSlice } from 'src/features/queue/queueSlice';
import { textResourcesSlice } from 'src/features/textResources/textResourcesSlice';
import { validationSlice } from 'src/features/validation/validationSlice';
import { deprecatedSlice } from 'src/redux/deprecatedSlice';
import { resetRootSagas } from 'src/redux/sagaSlice';
import type { SliceReducers } from 'src/redux/sagaSlice';

const slices = [
  applicationMetadataSlice,
  applicationSettingsSlice,
  attachmentSlice,
  dataListsSlice,
  devToolsSlice,
  footerLayoutSlice,
  formDataModelSlice,
  formDataSlice,
  formDynamicsSlice,
  formLayoutSlice,
  formRulesSlice,
  isLoadingSlice,
  optionsSlice,
  orgsSlice,
  partySlice,
  profileSlice,
  queueSlice,
  textResourcesSlice,
  validationSlice,
  deprecatedSlice,
];

type ReturnTypes<T extends Array<() => unknown>> = {
  [K in keyof T]: ReturnType<T[K]>;
};

type Whatever = SliceReducers<ReturnTypes<typeof slices>>;

const reducers = () => {
  resetRootSagas();

  const out = {};
  for (const slice of slices) {
    const result = slice();
    out[result.name] = result.reducer;
  }

  return out as typeof out & Whatever;
};

export const combinedReducers = () => combineReducers(reducers());
