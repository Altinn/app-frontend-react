import { combineReducers } from 'redux';

import { devToolsSlice } from 'src/features/devtools/data/devToolsSlice';
import { formLayoutSlice } from 'src/features/form/layout/formLayoutSlice';
import { resetRootSagas } from 'src/redux/sagaSlice';
import type { SliceReducers } from 'src/redux/sagaSlice';

const slices = [devToolsSlice, formLayoutSlice];

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
