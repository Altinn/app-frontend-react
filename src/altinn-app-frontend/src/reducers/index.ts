/* eslint-disable import/no-cycle */
import { combineReducers } from 'redux';
import OptionsReducer from '../shared/resources/options/optionsReducer';
import FormDataReducer from '../features/form/data/formDataReducer';
import formRulesSlice from 'src/features/form/rules/rulesSlice';
import InstantiationReducer from '../features/instantiate/instantiation/reducer';
import applicationMetadataSlice from 'src/shared/resources/applicationMetadata/applicationMetadataSlice';
import attachmentSlice from 'src/shared/resources/attachments/attachmentSlice';
import instanceDataSlice from 'src/shared/resources/instanceData/instanceDataSlice';
import OrgsReducer from '../shared/resources/orgs/orgsReducers';
import PartyReducer from '../shared/resources/party/partyReducers';
import processReducer from '../shared/resources/process/processReducer';
import ProfileReducer from '../shared/resources/profile/profileReducers';
import TextResourcesReducer from '../shared/resources/textResources/textResourcesReducer';
import { appApi } from 'src/services/AppApi';
import formDynamicsSlice from '../features/form/dynamics/formDynamicsSlice';
import formLayoutSlice from '../features/form/layout/formLayoutSlice';
import formDataModelSlice from '../features/form/datamodel/datamodelSlice';
import validationSlice from '../features/form/validation/validationSlice';
import isLoadingSlice from '../shared/resources/isLoading/isLoadingSlice';
import languageSlice from '../shared/resources/language/languageSlice';
import queueSlice from '../shared/resources/queue/queueSlice';
import applicationSettingsSlice from '../shared/resources/applicationSettings/applicationSettingsSlice';

const reducers = {
  [applicationMetadataSlice.name]: applicationMetadataSlice.reducer,
  [attachmentSlice.name]: attachmentSlice.reducer,
  formData: FormDataReducer,
  [formDataModelSlice.name]: formDataModelSlice.reducer,
  [formDynamicsSlice.name]: formDynamicsSlice.reducer,
  [formLayoutSlice.name]: formLayoutSlice.reducer,
  [formRulesSlice.name]: formRulesSlice.reducer,
  [validationSlice.name]: validationSlice.reducer,
  [instanceDataSlice.name]: instanceDataSlice.reducer,
  instantiation: InstantiationReducer,
  [isLoadingSlice.name]: isLoadingSlice.reducer,
  [languageSlice.name]: languageSlice.reducer,
  organisationMetaData: OrgsReducer,
  party: PartyReducer,
  process: processReducer,
  profile: ProfileReducer,
  [queueSlice.name]: queueSlice.reducer,
  textResources: TextResourcesReducer,
  optionState: OptionsReducer,
  [applicationSettingsSlice.name]: applicationSettingsSlice.reducer,
  [appApi.reducerPath]: appApi.reducer,
};

export default combineReducers(reducers);
