import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import createSagaMiddleware from 'redux-saga';
import type { PreloadedState } from '@reduxjs/toolkit';
import type { SagaMiddleware } from 'redux-saga';

import reducers from 'src/reducers';
import { appApi } from 'src/services/AppApi';

export const sagaMiddleware: SagaMiddleware<any> = createSagaMiddleware();
const middlewares = [sagaMiddleware, appApi.middleware];

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const innerStore = configureStore({
    reducer: reducers,
    devTools: isDev,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: isDev,
        immutableCheck: isDev,
      }).concat(middlewares),
    preloadedState,
  });

  setupListeners(innerStore.dispatch);
  return innerStore;
};

export const store = setupStore();

if (process.env.NODE_ENV === 'development') {
  // Expose store when running in Cypress. This allows for using cy.getReduxState() to run assertions against the redux
  // state at various points in the tests. Testing the state directly might expose problems not easily/visibly testable
  // in the app itself.
  (window as any).reduxStore = store;

  // Adds a function that does approximately what the export function from redux-devtools does:
  // https://github.com/reduxjs/redux-devtools/blob/b82de745928211cd9b7daa7a61b197ad9e11ec36/extension/src/browser/extension/inject/pageScript.ts#L220-L226
  (window as any).getRecordedStateHistory = () => {
    const liftedState = (store as any).liftedStore.getState();
    const actionsById = liftedState.actionsById;
    const payload: any[] = [];
    liftedState.stagedActionIds.slice(1).forEach((id) => {
      payload.push(actionsById[id].action);
    });
    return {
      payload: JSON.stringify(payload),
      preloadedState: JSON.stringify(store.getState()),
    };
  };
}

export type RootState = ReturnType<typeof reducers>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
