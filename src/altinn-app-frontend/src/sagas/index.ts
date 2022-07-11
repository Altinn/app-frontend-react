import type { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import FormDataSagas from '../features/form/data/formDataSagas';
import FormDataModelSagas from '../features/form/datamodel/datamodelSagas';
import FormLayoutSagas from '../features/form/layout/formLayoutSagas';
import FormRulesSagas from '../features/form/rules/rulesSagas';
import FormValidationSagas from '../features/form/validation/validationSagas';
import InstantiationSagas from '../features/instantiate/instantiation/sagas';
import ApplicationMetadataSagas from '../shared/resources/applicationMetadata/sagas';
import ApplicationSettingsSagas from '../shared/resources/applicationSettings/applicationSettingsSagas';
import Attachments from '../shared/resources/attachments/attachmentSagas';
import InstanceDataSagas from '../shared/resources/instanceData/instanceDataSagas';
import LanguageSagas from '../shared/resources/language/languageSagas';
import OrgsSagas from '../shared/resources/orgs/orgsSagas';
import PartySagas from '../shared/resources/party/partySagas';
import { processSagas } from '../shared/resources/process/processSagas';
import ProfileSagas from '../shared/resources/profile/profileSagas';
import TextResourcesSagas from '../shared/resources/textResources/textResourcesSagas';
import IsLoadingSagas from '../shared/resources/isLoading/isLoadingSagas';
import QueueSagas from '../shared/resources/queue/queueSagas';
import OptionSagas from '../shared/resources/options/optionsSagas';
import { sagaMiddleware } from 'src/store';
import { rootSagas } from 'src/shared/resources/utils/sagaSlice';

function* root(): SagaIterator {
  yield fork(FormDataSagas);
  yield fork(Attachments);
  yield fork(FormLayoutSagas);
  yield fork(FormRulesSagas);
  yield fork(FormDataModelSagas);
  yield fork(LanguageSagas);
  yield fork(TextResourcesSagas);
  yield fork(ProfileSagas);
  yield fork(FormValidationSagas);
  yield fork(PartySagas);
  yield fork(ApplicationMetadataSagas);
  yield fork(ApplicationSettingsSagas);
  yield fork(InstantiationSagas);
  yield fork(OrgsSagas);
  yield fork(InstanceDataSagas);
  yield fork(processSagas);
  yield fork(IsLoadingSagas);
  yield fork(QueueSagas);
  yield fork(OptionSagas);

  for (const sliceSaga of rootSagas) {
    yield fork(sliceSaga);
  }
}

export const initSagas = () => sagaMiddleware.run(root);
