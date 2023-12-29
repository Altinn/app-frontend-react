import { combineReducers } from 'redux';

import { applicationSettingsSlice } from 'src/features/applicationSettings/applicationSettingsSlice';
import { devToolsSlice } from 'src/features/devtools/data/devToolsSlice';
import { footerLayoutSlice } from 'src/features/footer/data/footerLayoutSlice';
import { formDynamicsSlice } from 'src/features/form/dynamics/formDynamicsSlice';
import { formLayoutSlice } from 'src/features/form/layout/formLayoutSlice';
import { formRulesSlice } from 'src/features/form/rules/rulesSlice';
import { textResourcesSlice } from 'src/features/language/textResources/textResourcesSlice';
import { orgsSlice } from 'src/features/orgs/orgsSlice';
import { profileSlice } from 'src/features/profile/profileSlice';
import { deprecatedSlice } from 'src/redux/deprecatedSlice';
import { resetRootSagas } from 'src/redux/sagaSlice';
import type { SliceReducers } from 'src/redux/sagaSlice';

const slices = [
  applicationSettingsSlice,
  devToolsSlice,
  footerLayoutSlice,
  formDynamicsSlice,
  formLayoutSlice,
  formRulesSlice,
  orgsSlice,
  profileSlice,
  textResourcesSlice,
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
