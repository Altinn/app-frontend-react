import { combineReducers } from 'redux';

import { applicationMetadataSlice } from 'src/features/applicationMetadata/applicationMetadataSlice';
import { applicationSettingsSlice } from 'src/features/applicationSettings/applicationSettingsSlice';
import { attachmentSlice } from 'src/features/attachments/attachmentSlice';
import { footerLayoutSlice } from 'src/features/footer/data/footerLayoutSlice';
import { formDataSlice } from 'src/features/form/data/formDataSlice';
import { formDataModelSlice } from 'src/features/form/datamodel/datamodelSlice';
import { formDynamicsSlice } from 'src/features/form/dynamics/formDynamicsSlice';
import { formLayoutSlice } from 'src/features/form/layout/formLayoutSlice';
import { formRulesSlice } from 'src/features/form/rules/rulesSlice';
import { validationSlice } from 'src/features/form/validation/validationSlice';
import { instanceDataSlice } from 'src/features/instanceData/instanceDataSlice';
import { instantiationSlice } from 'src/features/instantiate/instantiation/instantiationSlice';
import { isLoadingSlice } from 'src/features/isLoading/isLoadingSlice';
import { languageSlice } from 'src/features/language/languageSlice';
import { optionsSlice } from 'src/features/options/optionsSlice';
import { orgsSlice } from 'src/features/orgs/orgsSlice';
import { partySlice } from 'src/features/party/partySlice';
import { pdfSlice } from 'src/features/pdf/data/pdfSlice';
import { processSlice } from 'src/features/process/processSlice';
import { profileSlice } from 'src/features/profile/profileSlice';
import { queueSlice } from 'src/features/queue/queueSlice';
import { textResourcesSlice } from 'src/features/textResources/textResourcesSlice';
import { appApi } from 'src/services/AppApi';
import { dataListsSlice } from 'src/shared/resources/dataLists/dataListsSlice';

const reducers = {
  [applicationMetadataSlice.name]: applicationMetadataSlice.reducer,
  [attachmentSlice.name]: attachmentSlice.reducer,
  [formDataSlice.name]: formDataSlice.reducer,
  [formDataModelSlice.name]: formDataModelSlice.reducer,
  [formDynamicsSlice.name]: formDynamicsSlice.reducer,
  [formLayoutSlice.name]: formLayoutSlice.reducer,
  [formRulesSlice.name]: formRulesSlice.reducer,
  [footerLayoutSlice.name]: footerLayoutSlice.reducer,
  [validationSlice.name]: validationSlice.reducer,
  [instanceDataSlice.name]: instanceDataSlice.reducer,
  [instantiationSlice.name]: instantiationSlice.reducer,
  [isLoadingSlice.name]: isLoadingSlice.reducer,
  [languageSlice.name]: languageSlice.reducer,
  [orgsSlice.name]: orgsSlice.reducer,
  [partySlice.name]: partySlice.reducer,
  [pdfSlice.name]: pdfSlice.reducer,
  [processSlice.name]: processSlice.reducer,
  [profileSlice.name]: profileSlice.reducer,
  [queueSlice.name]: queueSlice.reducer,
  [textResourcesSlice.name]: textResourcesSlice.reducer,
  [optionsSlice.name]: optionsSlice.reducer,
  [dataListsSlice.name]: dataListsSlice.reducer,
  [applicationSettingsSlice.name]: applicationSettingsSlice.reducer,
  [appApi.reducerPath]: appApi.reducer,
};

export const combinedReducers = combineReducers(reducers);
