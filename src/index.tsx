// Needed for "useBuiltIns": "entry" in babel.config.json to resolve
// all the polyfills we need and inject them here
import 'core-js';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createHashRouter, RouterProvider, useLocation } from 'react-router-dom';

import 'src/features/toggles';
import 'src/features/logging';
import 'src/features/styleInjection';

import { AppWrapper } from '@altinn/altinn-design-system';

import { App } from 'src/App';
import { ErrorBoundary } from 'src/components/ErrorBoundary';
import { ThemeWrapper } from 'src/components/ThemeWrapper';
import { AppQueriesProvider } from 'src/contexts/appQueriesContext';
import { DevTools } from 'src/features/devtools/DevTools';
import { LayoutValidationProvider } from 'src/features/devtools/layoutValidation/useLayoutValidation';
import { InstantiationProvider } from 'src/features/instantiate/InstantiationContext';
import { AllOptionsProvider } from 'src/features/options/useAllOptions';
import * as queries from 'src/queries/queries';
import { initSagas } from 'src/redux/sagas';
import { setupStore } from 'src/redux/store';
import { ExprContextWrapper } from 'src/utils/layout/ExprContext';

import 'src/index.css';

const router = createHashRouter([
  {
    path: '*',
    element: <Root />,
  },
]);

document.addEventListener('DOMContentLoaded', () => {
  const { store, sagaMiddleware } = setupStore();
  initSagas(sagaMiddleware);

  const container = document.getElementById('root');
  const root = container && createRoot(container);
  root?.render(
    <Provider store={store}>
      <ErrorBoundary>
        <AppWrapper>
          <AppQueriesProvider {...queries}>
            <ThemeWrapper>
              <RouterProvider router={router} />
            </ThemeWrapper>
          </AppQueriesProvider>
        </AppWrapper>
      </ErrorBoundary>
    </Provider>,
  );
});

function Root() {
  const location = useLocation();
  console.log('Location: ', location.pathname);
  return (
    <InstantiationProvider>
      <ExprContextWrapper>
        <LayoutValidationProvider>
          <AllOptionsProvider>
            <DevTools>
              <App />
            </DevTools>
          </AllOptionsProvider>
        </LayoutValidationProvider>
      </ExprContextWrapper>
    </InstantiationProvider>
  );
}
