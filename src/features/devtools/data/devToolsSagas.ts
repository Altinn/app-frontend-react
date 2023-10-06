import { call, put } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { DevToolsActions } from 'src/features/devtools/data/devToolsSlice';
import { waitForSelector } from 'src/utils/pdf';

export function* previewPdfSaga(): SagaIterator {
  yield put(DevToolsActions.setPdfPreview({ preview: true }));
  const el = yield call(waitForSelector, '#pdfView #readyForPrint', 5000);
  if (el) {
    window.print();
  }
  yield put(DevToolsActions.setPdfPreview({ preview: false }));
}
