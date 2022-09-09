import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';

import { AppWrapper } from '@altinn/altinn-design-system';
import { createTheme, MuiThemeProvider } from '@material-ui/core';

import { App } from 'src/App';
import ErrorBoundary from 'src/components/ErrorBoundary';
import { initSagas } from 'src/sagas';
import { store } from 'src/store';

// import { appPath } from 'src/utils/appUrlHelper'; // appPath should be added to basename if browser-router is used
import { AltinnAppTheme } from 'altinn-shared/theme';

import 'src/index.css';

initSagas();

const theme = createTheme(AltinnAppTheme);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <Router>
      <AppWrapper>
        <MuiThemeProvider theme={theme}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </MuiThemeProvider>
      </AppWrapper>
    </Router>
  </Provider>,
);
