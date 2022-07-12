import type { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import InstantiationSagas from '../features/instantiate/instantiation/sagas';
import ApplicationMetadataSagas from '../shared/resources/applicationMetadata/sagas';
import ApplicationSettingsSagas from '../shared/resources/applicationSettings/applicationSettingsSagas';
import Attachments from '../shared/resources/attachments/attachmentSagas';
import InstanceDataSagas from '../shared/resources/instanceData/instanceDataSagas';
import LanguageSagas from '../shared/resources/language/languageSagas';
import OrgsSagas from '../shared/resources/orgs/orgsSagas';
import PartySagas from '../shared/resources/party/partySagas';
import { processSagas } from '../shared/resources/process/processSagas';
import OptionSagas from '../shared/resources/options/optionsSagas';
import { sagaMiddleware } from 'src/store';
import { rootSagas } from 'src/shared/resources/utils/sagaSlice';

function* root(): SagaIterator {
  yield fork(Attachments);
  yield fork(LanguageSagas);
  yield fork(PartySagas);
  yield fork(ApplicationMetadataSagas);
  yield fork(ApplicationSettingsSagas);
  yield fork(InstantiationSagas);
  yield fork(OrgsSagas);
  yield fork(InstanceDataSagas);
  yield fork(processSagas);
  yield fork(OptionSagas);

  for (const sliceSaga of rootSagas) {
    yield fork(sliceSaga);
  }
}

export const initSagas = () => sagaMiddleware.run(root);
