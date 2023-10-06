import React from 'react';
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';

import { createTheme, MuiThemeProvider } from '@material-ui/core';
import { render as rtlRender } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { PreloadedState } from 'redux';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { getInstanceDataMock } from 'src/__mocks__/instanceDataStateMock';
import { AppQueriesProvider } from 'src/contexts/appQueriesContext';
import { InstantiationProvider } from 'src/features/instantiate/InstantiationContext';
import { AllOptionsProvider } from 'src/features/options/useAllOptions';
import { setupStore } from 'src/redux/store';
import { MemoryRouterWithRedirectingRoot } from 'src/test/memoryRouterWithRedirectingRoot';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import { ExprContextWrapper, useResolvedNode } from 'src/utils/layout/ExprContext';
import type { AppQueriesContext } from 'src/contexts/appQueriesContext';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IDataList } from 'src/features/dataLists';
import type { IFooterLayout } from 'src/features/footer/types';
import type { IComponentProps, PropsFromGenericComponent } from 'src/layout';
import type { CompExternalExact, CompTypes } from 'src/layout/layout';
import type { AppStore, RootState } from 'src/redux/store';
import type { ILayoutSets, IRuntimeState } from 'src/types';
import type { IProfile } from 'src/types/shared';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
  Router?: (props: React.PropsWithChildren) => React.ReactNode;
}

const exampleGuid = '75154373-aed4-41f7-95b4-e5b5115c2edc';
const exampleInstanceId = `512345/${exampleGuid}`;

export const renderWithProviders = (
  component: any,
  {
    preloadedState = {},
    store = setupStore(preloadedState).store,
    Router,
    ...renderOptions
  }: ExtendedRenderOptions = {},
  queries?: Partial<AppQueriesContext>,
) => {
  function Wrapper({ children }: React.PropsWithChildren) {
    const theme = createTheme(AltinnAppTheme);

    const allMockedQueries = {
      doPartyValidation: () => Promise.resolve({ valid: true, validParties: [], message: null }),
      doInstantiateWithPrefill: () => Promise.resolve(getInstanceDataMock()),
      doInstantiate: () => Promise.resolve(getInstanceDataMock()),
      doProcessNext: () => Promise.resolve(getInstanceDataMock().process),
      fetchActiveInstances: () => Promise.resolve([]),
      fetchApplicationMetadata: () => Promise.resolve({} as unknown as IApplicationMetadata),
      fetchCurrentParty: () => Promise.resolve({}),
      fetchApplicationSettings: () => Promise.resolve({}),
      fetchFooterLayout: () => Promise.resolve({ footer: [] } as IFooterLayout),
      fetchLayoutSets: () => Promise.resolve({} as unknown as ILayoutSets),
      fetchOrgs: () => Promise.resolve({ orgs: {} }),
      fetchUserProfile: () => Promise.resolve({} as unknown as IProfile),
      fetchDataModelSchema: () => Promise.resolve({}),
      fetchParties: () => Promise.resolve({}),
      fetchRefreshJwtToken: () => Promise.resolve({}),
      fetchFormData: () => Promise.resolve({}),
      fetchOptions: () => Promise.resolve([]),
      fetchDataList: () => Promise.resolve({} as unknown as IDataList),
      fetchInstanceData: () => Promise.resolve(getInstanceDataMock()),
      fetchAppLanguages: () => Promise.resolve([]),
      fetchProcessState: () => Promise.resolve(getInstanceDataMock().process),
      fetchProcessNextSteps: () => Promise.resolve([]),
    } as AppQueriesContext;
    const mockedQueries = { ...allMockedQueries, ...queries };

    if (!Router) {
      return (
        <MemoryRouterWithRedirectingRoot to={`instance/${exampleInstanceId}`}>
          <AppQueriesProvider {...mockedQueries}>
            <MuiThemeProvider theme={theme}>
              <Provider store={store}>
                <InstantiationProvider>
                  <ExprContextWrapper>
                    <Route
                      path={'instance/:partyId/:instanceGuid'}
                      element={children}
                    />
                  </ExprContextWrapper>
                </InstantiationProvider>
              </Provider>
            </MuiThemeProvider>
          </AppQueriesProvider>
        </MemoryRouterWithRedirectingRoot>
      );
    }

    return (
      <Router>
        <AppQueriesProvider {...mockedQueries}>
          <MuiThemeProvider theme={theme}>
            <Provider store={store}>
              <ExprContextWrapper>
                <AllOptionsProvider>{children}</AllOptionsProvider>
              </ExprContextWrapper>
            </Provider>
          </MuiThemeProvider>
        </AppQueriesProvider>
      </Router>
    );
  }

  return {
    store,
    ...rtlRender(component, {
      wrapper: Wrapper,
      ...renderOptions,
    }),
  };
};

export interface RenderGenericComponentTestProps<T extends CompTypes> {
  type: T;
  renderer: (props: PropsFromGenericComponent<T>) => JSX.Element;
  component?: Partial<CompExternalExact<T>>;
  genericProps?: Partial<PropsFromGenericComponent<T>>;
  manipulateState?: (state: IRuntimeState) => void;
  manipulateStore?: (store: ReturnType<typeof setupStore>['store']) => void;
  mockedQueries?: Partial<AppQueriesContext>;
}

export function renderGenericComponentTest<T extends CompTypes>({
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
    const node = useResolvedNode(realComponentDef.id) as any;
    const props: PropsFromGenericComponent<T> = {
      node,
      ...mockComponentProps,
      ...genericProps,
    };

    return renderer(props);
  };

  const preloadedState = getInitialStateMock();
  manipulateState && manipulateState(preloadedState);
  preloadedState.formLayout.layouts?.FormLayout?.push(realComponentDef);

  const { store } = setupStore(preloadedState);
  manipulateStore && manipulateStore(store);

  return {
    ...renderWithProviders(<Wrapper />, { store }, mockedQueries),
  };
}

export const mockComponentProps: IComponentProps & { id: string } = {
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
