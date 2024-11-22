// Needed for "useBuiltIns": "entry" in babel.config.json to resolve
// all the polyfills we need and inject them here
import 'core-js';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { createHashRouter, RouterProvider, ScrollRestoration } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';

import 'src/features/baseurlinjection';
import 'src/features/toggles';
import 'src/features/logging';
import 'src/features/styleInjection';
import '@digdir/designsystemet-css';

import { AppWrapper } from '@altinn/altinn-design-system';
import axios from 'axios';

import { App } from 'src/App';
import { ErrorBoundary } from 'src/components/ErrorBoundary';
import { ThemeWrapper } from 'src/components/ThemeWrapper';
import { KeepAliveProvider } from 'src/core/auth/KeepAliveProvider';
import { AppQueriesProvider } from 'src/core/contexts/AppQueriesProvider';
import { TaskStoreProvider } from 'src/core/contexts/taskStoreContext';
import { ApplicationMetadataProvider } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { ApplicationSettingsProvider } from 'src/features/applicationSettings/ApplicationSettingsProvider';
import { UiConfigProvider } from 'src/features/form/layout/UiConfigContext';
import { LayoutSetsProvider } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { GlobalFormDataReadersProvider } from 'src/features/formData/FormDataReaders';
import { InstantiationProvider } from 'src/features/instantiate/InstantiationContext';
import { LangToolsStoreProvider } from 'src/features/language/LangToolsStore';
import { LanguageProvider } from 'src/features/language/LanguageProvider';
import { TextResourcesProvider } from 'src/features/language/textResources/TextResourcesProvider';
import { OrgsProvider } from 'src/features/orgs/OrgsProvider';
import { PartyProvider } from 'src/features/party/PartiesProvider';
import { ProfileProvider } from 'src/features/profile/ProfileProvider';
import { AppRoutingProvider, getSearch, SearchParams } from 'src/features/routing/AppRoutingContext';
import { AppPrefetcher } from 'src/queries/appPrefetcher';
import { PartyPrefetcher } from 'src/queries/partyPrefetcher';
import * as queries from 'src/queries/queries';
import { appPath } from 'src/utils/urls/appUrlHelper';

import 'react-toastify/dist/ReactToastify.css';
import 'src/index.css';
import '@digdir/designsystemet-theme/brand/altinn/tokens.css';

const router = createHashRouter([
  {
    path: '*',
    element: (
      <AppRoutingProvider>
        <ErrorBoundary>
          <Root />
        </ErrorBoundary>
      </AppRoutingProvider>
    ),
  },
]);

function getCookies(): { [key: string]: string } {
  const cookie = {};
  document.cookie.split(';').forEach((el) => {
    const split = el.split('=');
    cookie[split[0].trim()] = split.slice(1).join('=');
  });
  return cookie;
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  const root = container && createRoot(container);
  root?.render(
    <AppQueriesProvider {...queries}>
      <AppPrefetcher />
      <ErrorBoundary>
        <AppWrapper>
          <LanguageProvider>
            <LangToolsStoreProvider>
              <ThemeWrapper>
                <UiConfigProvider>
                  <RouterProvider router={router} />
                </UiConfigProvider>
              </ThemeWrapper>
            </LangToolsStoreProvider>
          </LanguageProvider>
        </AppWrapper>
      </ErrorBoundary>
    </AppQueriesProvider>,
  );
});

function Root() {
  const isPdf = new URLSearchParams(getSearch('')).get(SearchParams.Pdf) === '1';

  if (isPdf) {
    const cookies = getCookies();
    axios.interceptors.request.use((config) => {
      if (config.url?.startsWith(appPath) !== true) {
        return config;
      }

      config.headers['X-Altinn-IsPdf'] = 'true';

      const traceparent = cookies['altinn-telemetry-traceparent'];
      const tracestate = cookies['altinn-telemetry-tracestate'];
      if (traceparent) {
        config.headers['traceparent'] = traceparent;
      }
      if (tracestate) {
        config.headers['tracestate'] = tracestate;
      }
      return config;
    });
  }

  return (
    <InstantiationProvider>
      <TaskStoreProvider>
        <ApplicationMetadataProvider>
          <GlobalFormDataReadersProvider>
            <LayoutSetsProvider>
              <ProfileProvider>
                <TextResourcesProvider>
                  <OrgsProvider>
                    <ApplicationSettingsProvider>
                      <PartyProvider>
                        <KeepAliveProvider>
                          <HelmetProvider>
                            <App />
                            <ToastContainer
                              position='top-center'
                              theme='colored'
                              transition={Slide}
                              draggable={false}
                            />
                          </HelmetProvider>
                          <ScrollRestoration />
                        </KeepAliveProvider>
                      </PartyProvider>
                    </ApplicationSettingsProvider>
                  </OrgsProvider>
                </TextResourcesProvider>
              </ProfileProvider>
              <PartyPrefetcher />
            </LayoutSetsProvider>
          </GlobalFormDataReadersProvider>
        </ApplicationMetadataProvider>
      </TaskStoreProvider>
    </InstantiationProvider>
  );
}
