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

import { App } from 'src/App';
import { ErrorBoundary } from 'src/components/ErrorBoundary';
import { ViewportWrapper } from 'src/components/ViewportWrapper';
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
import { propagateTraceWhenPdf } from 'src/features/propagateTraceWhenPdf';
import { AppRoutingProvider } from 'src/features/routing/AppRoutingContext';
import { AppPrefetcher } from 'src/queries/appPrefetcher';
import { PartyPrefetcher } from 'src/queries/partyPrefetcher';
import * as queries from 'src/queries/queries';

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

document.addEventListener('DOMContentLoaded', () => {
  propagateTraceWhenPdf();

  const container = document.getElementById('root');
  const root = container && createRoot(container);
  root?.render(
    <AppQueriesProvider {...queries}>
      <AppPrefetcher />
      <ErrorBoundary>
        <AppWrapper>
          <LanguageProvider>
            <LangToolsStoreProvider>
              <ViewportWrapper>
                <UiConfigProvider>
                  <RouterProvider router={router} />
                </UiConfigProvider>
              </ViewportWrapper>
            </LangToolsStoreProvider>
          </LanguageProvider>
        </AppWrapper>
      </ErrorBoundary>
    </AppQueriesProvider>,
  );
});

function Root() {
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
                            <TaskStoreProvider>
                              <App />
                            </TaskStoreProvider>
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
//
// const params = {
//   productOwner: 'Ronny',
//   designer: 'Edvin',
// };
//
// const modelPrefill = {
//   dataModel1: {
//     $schema: 'https://altinncdn.no/schemas/json/prefill/prefill.schema.v1.json',
//     allowOverwrite: false,
//     ER: {},
//     DSF: {
//       FirstName: 'opplysningerOmArbeidstakerengrp8819.opplysningerOmArbeidstakerengrp8855.ansattNavndatadef1223.value',
//     },
//     UserProfile: {},
//     QueryParams: {
//       // Mapping fra queryParam til stateless datamodell
//       productOwner: 'datamodel.PO',
//       programmer: 'datamodel.designer',
//     },
//   },
//   dataModel2: {
//     $schema: 'https://altinncdn.no/schemas/json/prefill/prefill.schema.v1.json',
//     allowOverwrite: false,
//     ER: {},
//     DSF: {
//       FirstName: 'opplysningerOmArbeidstakerengrp8819.opplysningerOmArbeidstakerengrp8855.ansattNavndatadef1223.value',
//     },
//     UserProfile: {},
//     QueryParams: {
//       // Mapping fra queryParam til stateless datamodell
//       productOwner: 'queryParams1',
//       programmer: 'queryParams2',
//     },
//   },
// };
//
// interface QueryParamPrefil {
//   dataModelName: string;
//   prefillFields: Record<string, string>[]; //[key: string]: string[]
// }
//
// const result: Array<QueryParamPrefil> = Object.entries(modelPrefill).map((entry) => ({
//   dataModelName: entry[0],
//   prefillFields: Object.entries(entry[1].QueryParams)
//     .filter(([key]) => params[key] !== undefined) // Only include keys that exist in params
//     .map((queryParam) => ({
//       [queryParam[1]]: params[queryParam[0]],
//     })),
// }));
//
// // const result: Array<QueryParamPrefil> = Object.entries(modelPrefill).map((entry) => ({
// //   dataModelName: entry[0],
// //   prefillFields: Object.entries(entry[1].QueryParams).map((queryParam) => {
// //     console.log('quer', queryParam);
// //     return {
// //       [queryParam[1]]: params[queryParam[0]],
// //     };
// //   }),
// // }));
//
// console.log(JSON.stringify(result, null, 2));
//
// // const result: Array<QueryParamPrefil> = [
// //   {
// //     dataModelName: 'dataModel1',
// //     prefillFields: [
// //       {
// //         'datamodel.designer': 'Edvin',
// //         'datamodel.PO': 'Ronny',
// //       },
// //     ],
// //   },
// // ];
