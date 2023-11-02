import React from 'react';
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';

import { createTheme, MuiThemeProvider } from '@material-ui/core';
import { render as rtlRender, waitFor } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { JSONSchema7 } from 'json-schema';
import type { PreloadedState } from 'redux';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { getInstanceDataMock, getProcessDataMock } from 'src/__mocks__/instanceDataStateMock';
import { AppQueriesProvider } from 'src/contexts/appQueriesContext';
import { FormProvider } from 'src/features/form/FormContext';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { generateSimpleRepeatingGroups } from 'src/features/form/layout/repGroups/generateSimpleRepeatingGroups';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { InstantiationProvider } from 'src/features/instantiate/InstantiationContext';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { setupStore } from 'src/redux/store';
import { MemoryRouterWithRedirectingRoot } from 'src/test/memoryRouterWithRedirectingRoot';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import { ExprContextWrapper, useExprContext, useResolvedNode } from 'src/utils/layout/ExprContext';
import type { AppQueriesContext } from 'src/contexts/appQueriesContext';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IDataList } from 'src/features/dataLists';
import type { IFooterLayout } from 'src/features/footer/types';
import type { IComponentProps, PropsFromGenericComponent } from 'src/layout';
import type { CompExternalExact, CompTypes, ILayoutCollection } from 'src/layout/layout';
import type { AppStore, RootState } from 'src/redux/store';
import type { ILayoutSets, IRuntimeState } from 'src/types';
import type { IProfile } from 'src/types/shared';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  component: React.ReactElement;
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
  Router?: (props: React.PropsWithChildren) => React.ReactNode;
  waitUntilLoaded?: boolean;
  mockedQueries?: Partial<AppQueriesContext>;
}

const exampleGuid = '75154373-aed4-41f7-95b4-e5b5115c2edc';
const exampleInstanceId = `512345/${exampleGuid}`;

export const renderWithProviders = async ({
  component,
  preloadedState = {},
  store = setupStore(preloadedState).store,
  Router,
  mockedQueries = {},
  waitUntilLoaded = true,
  ...renderOptions
}: ExtendedRenderOptions) => {
  function Wrapper({ children }: React.PropsWithChildren) {
    const theme = createTheme(AltinnAppTheme);

    const state = store?.getState();
    const layouts = state?.formLayout.layouts || {};
    const layoutsAsCollection: ILayoutCollection = {};
    for (const key in layouts) {
      layoutsAsCollection[key] = {
        data: {
          layout: layouts[key] || [],
        },
      };
    }
    const applicationMetaData = state?.applicationMetadata.applicationMetadata || ({} as IApplicationMetadata);

    const allMockedQueries: AppQueriesContext = {
      doPartyValidation: () => Promise.resolve({ valid: true, validParties: [], message: null }),
      doSelectParty: () => Promise.resolve(null),
      doInstantiateWithPrefill: () => Promise.resolve(getInstanceDataMock()),
      doInstantiate: () => Promise.resolve(getInstanceDataMock()),
      doProcessNext: () => Promise.resolve(getProcessDataMock()),
      doAttachmentUpload: () => Promise.reject(null),
      doAttachmentRemoveTag: () => Promise.reject(null),
      doAttachmentAddTag: () => Promise.reject(null),
      doAttachmentRemove: () => Promise.reject(null),
      fetchActiveInstances: () => Promise.resolve([]),
      fetchApplicationMetadata: () => Promise.resolve(applicationMetaData),
      fetchCurrentParty: () => Promise.resolve({}),
      fetchApplicationSettings: () => Promise.resolve({}),
      fetchFooterLayout: () => Promise.resolve({ footer: [] } as IFooterLayout),
      fetchLayoutSets: () => Promise.resolve({} as unknown as ILayoutSets),
      fetchLayouts: () => Promise.resolve(layoutsAsCollection),
      fetchLayoutSettings: () =>
        Promise.resolve({
          pages: {
            order: Object.keys(layouts),
          },
        }),
      fetchOrgs: () => Promise.resolve({ orgs: {} }),
      fetchUserProfile: () => Promise.resolve({} as unknown as IProfile),
      fetchDataModelSchema: () => Promise.resolve({}),
      fetchParties: () => Promise.resolve({}),
      fetchRefreshJwtToken: () => Promise.resolve({}),
      fetchCustomValidationConfig: () => Promise.resolve(null),
      fetchFormData: () => Promise.resolve({}),
      fetchOptions: () => Promise.resolve([]),
      fetchDataList: () => Promise.resolve({} as unknown as IDataList),
      fetchPdfFormat: () => Promise.resolve({ excludedPages: [], excludedComponents: [] }),
      fetchDynamics: () => Promise.resolve(null),
      fetchRuleHandler: () => Promise.resolve(null),
      fetchTextResources: () => Promise.resolve({ language: 'nb', resources: [] }),
      fetchLayoutSchema: () => Promise.resolve({} as JSONSchema7),
      fetchInstanceData: () => Promise.resolve(getInstanceDataMock()),
      fetchAppLanguages: () => Promise.resolve([]),
      fetchProcessState: () => Promise.resolve(getProcessDataMock()),
      fetchProcessNextSteps: () => Promise.resolve([]),
    };

    const queries = {
      ...allMockedQueries,
      ...mockedQueries,
    };

    if (!Router) {
      return (
        <AppQueriesProvider {...queries}>
          <MuiThemeProvider theme={theme}>
            <Provider store={store}>
              <ExprContextWrapper>
                <MemoryRouterWithRedirectingRoot to={`instance/${exampleInstanceId}`}>
                  <Route
                    path={'instance/:partyId/:instanceGuid'}
                    element={
                      <InstantiationProvider>
                        <InstanceProvider provideLayoutValidation={false}>
                          <FormProvider>{children}</FormProvider>
                        </InstanceProvider>
                      </InstantiationProvider>
                    }
                  />
                </MemoryRouterWithRedirectingRoot>
              </ExprContextWrapper>
            </Provider>
          </MuiThemeProvider>
        </AppQueriesProvider>
      );
    }

    return (
      <Router>
        <AppQueriesProvider {...queries}>
          <MuiThemeProvider theme={theme}>
            <Provider store={store}>
              <ExprContextWrapper>
                <InstantiationProvider>
                  <InstanceProvider provideLayoutValidation={false}>
                    <FormProvider>{children}</FormProvider>
                  </InstanceProvider>
                </InstantiationProvider>
              </ExprContextWrapper>
            </Provider>
          </MuiThemeProvider>
        </AppQueriesProvider>
      </Router>
    );
  }

  const out = {
    store,
    ...rtlRender(component, {
      wrapper: Wrapper,
      ...renderOptions,
    }),
  };

  if (waitUntilLoaded) {
    // This little magic is needed to wait for the initial state to be loaded. It will catch both the loading state
    // in renderGenericComponentTest() below, but also the <Loader /> component.
    await waitFor(() => expect(out.queryByText('Loading...')).not.toBeInTheDocument());
  }

  return out;
};

export interface RenderGenericComponentTestProps<T extends CompTypes> {
  type: T;
  renderer: (props: PropsFromGenericComponent<T>) => JSX.Element;
  component?: Partial<CompExternalExact<T>>;
  genericProps?: Partial<PropsFromGenericComponent<T>>;
  manipulateState?: (state: IRuntimeState) => void;
  manipulateStore?: (store: ReturnType<typeof setupStore>['store']) => void;
  mockedQueries?: Partial<AppQueriesContext>;
  waitUntilLoaded?: boolean;
}

export async function renderGenericComponentTest<T extends CompTypes>({
  type,
  renderer,
  component,
  genericProps,
  manipulateState,
  manipulateStore,
  mockedQueries,
}: RenderGenericComponentTestProps<T>) {
  const realComponentDef = {
    id: 'my-test-component-id',
    type,
    ...component,
  } as any;

  const Wrapper = () => {
    const dispatch = useAppDispatch();
    const layouts = useAppSelector((state) => state.formLayout.layouts);
    const currentView = useAppSelector((state) => state.formLayout.uiConfig.currentView);
    const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);

    const waitingFor: string[] = [];
    if (!layouts) {
      waitingFor.push('layouts');
    }
    if (!currentView) {
      waitingFor.push('currentView');
    }
    if (!repeatingGroups) {
      waitingFor.push('repeatingGroups');
    }

    if (waitingFor.length === 1 && waitingFor[0] === 'repeatingGroups' && layouts) {
      dispatch(FormLayoutActions.initRepeatingGroupsFulfilled({ updated: generateSimpleRepeatingGroups(layouts) }));
    }

    const root = useExprContext();
    const node = useResolvedNode(realComponentDef.id) as any;
    const props: PropsFromGenericComponent<T> = {
      node,
      ...(mockComponentProps as unknown as IComponentProps<T>),
      ...genericProps,
    };

    if (!node) {
      return (
        <>
          <div>Node not found: {realComponentDef.id}</div>
          {root ? (
            <div>All other nodes loaded</div>
          ) : (
            <>
              <div>Loading...</div>
              <div>Waiting for {waitingFor.join(', ')}</div>
            </>
          )}
        </>
      );
    }

    return renderer(props);
  };

  const preloadedState = getInitialStateMock();
  manipulateState && manipulateState(preloadedState);
  preloadedState.formLayout.layouts?.FormLayout?.push(realComponentDef);

  const { store } = setupStore(preloadedState);
  manipulateStore && manipulateStore(store);

  return {
    ...(await renderWithProviders({ component: <Wrapper />, store, mockedQueries })),
  };
}

export const mockComponentProps: IComponentProps<CompTypes> & { id: string } = {
  id: 'component-id',
  formData: {},
  handleDataChange: () => {
    throw new Error('Called mock handleDataChange, override this yourself');
  },
  shouldFocus: false,
  isValid: undefined,
  componentValidations: {},
  label: () => {
    throw new Error('Rendered mock label, override this yourself');
  },
  legend: () => {
    throw new Error('Rendered mock legend, override this yourself');
  },
};
