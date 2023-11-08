import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { createTheme, MuiThemeProvider } from '@material-ui/core';
import { render as rtlRender, waitFor } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { JSONSchema7 } from 'json-schema';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { getInstanceDataMock, getProcessDataMock } from 'src/__mocks__/instanceDataStateMock';
import { AppQueriesProvider } from 'src/contexts/appQueriesContext';
import { generateSimpleRepeatingGroups } from 'src/features/form/layout/repGroups/generateSimpleRepeatingGroups';
import { InstanceProvider } from 'src/features/instance/InstanceContext';
import { InstantiationProvider } from 'src/features/instantiate/InstantiationContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { setupStore } from 'src/redux/store';
import { MemoryRouterWithRedirectingRoot } from 'src/test/memoryRouterWithRedirectingRoot';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import { ExprContextWrapper, useExprContext } from 'src/utils/layout/ExprContext';
import type { AppMutations, AppQueries, AppQueriesContext } from 'src/contexts/appQueriesContext';
import type { IDataList } from 'src/features/dataLists';
import type { IFooterLayout } from 'src/features/footer/types';
import type { IComponentProps, PropsFromGenericComponent } from 'src/layout';
import type { CompExternalExact, CompTypes, ILayoutCollection, ILayouts } from 'src/layout/layout';
import type { ILayoutSets, IRuntimeState } from 'src/types';
import type { IProfile } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

/**
 * These are the queries that cannot be mocked. Instead of mocking the queries themselves, you should provide preloaded
 * state that contains the state you need. In the future when we get rid of redux, all queries will be mockable.
 */
type QueriesThatCannotBeMocked = 'fetchInstanceData' | 'fetchProcessState' | 'fetchLayoutSettings' | 'fetchLayouts';

type MockableQueries = Omit<AppQueries, QueriesThatCannotBeMocked>;
type UnMockableQueries = Pick<AppQueries, QueriesThatCannotBeMocked>;

type MockedMutations = {
  [fn in keyof AppMutations]: {
    mock: AppMutations[fn];
    resolve: (retVal: Awaited<ReturnType<AppMutations[fn]>>) => void;
    reject: (error: Error) => void;
  };
};

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  renderer: () => React.ReactElement;
  router?: (props: PropsWithChildren) => React.ReactNode;
  waitUntilLoaded?: boolean;
  queries?: Partial<MockableQueries>;
  reduxState?: IRuntimeState;
  reduxGateKeeper?: (action: any) => boolean;
}

interface BaseRenderOptions extends ExtendedRenderOptions {
  unMockableQueries?: Partial<UnMockableQueries>;
}

const exampleGuid = '75154373-aed4-41f7-95b4-e5b5115c2edc';
const exampleInstanceId = `512345/${exampleGuid}`;

export function promiseMock<T extends (...args: unknown[]) => unknown>() {
  const mock = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  mock.mockImplementation(
    () =>
      new Promise<T>((res, rej) => {
        resolve.mockImplementation(res);
        reject.mockImplementation(rej);
      }),
  );

  return { mock, resolve, reject } as unknown as {
    mock: T;
    resolve: (retVal: Awaited<ReturnType<T>>) => void;
    reject: (error: Error) => void;
  };
}

function mutationsMap(mutations: MockedMutations) {
  return Object.fromEntries(Object.entries(mutations).map(([key, value]) => [key, value.mock])) as AppMutations;
}

const mutations: MockedMutations = {
  doAttachmentAddTag: promiseMock<AppMutations['doAttachmentAddTag']>(),
  doAttachmentRemove: promiseMock<AppMutations['doAttachmentRemove']>(),
  doAttachmentRemoveTag: promiseMock<AppMutations['doAttachmentRemoveTag']>(),
  doAttachmentUpload: promiseMock<AppMutations['doAttachmentUpload']>(),
  doInstantiate: promiseMock<AppMutations['doInstantiate']>(),
  doInstantiateWithPrefill: promiseMock<AppMutations['doInstantiateWithPrefill']>(),
  doPartyValidation: promiseMock<AppMutations['doPartyValidation']>(),
  doProcessNext: promiseMock<AppMutations['doProcessNext']>(),
  doSelectParty: promiseMock<AppMutations['doSelectParty']>(),
};

const defaultQueryMocks: MockableQueries = {
  fetchApplicationMetadata: () => Promise.resolve(getInitialStateMock().applicationMetadata.applicationMetadata!),
  fetchActiveInstances: () => Promise.resolve([]),
  fetchCurrentParty: () => Promise.resolve({}),
  fetchApplicationSettings: () => Promise.resolve({}),
  fetchFooterLayout: () => Promise.resolve({ footer: [] } as IFooterLayout),
  fetchLayoutSets: () => Promise.resolve({} as unknown as ILayoutSets),
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
  fetchAppLanguages: () => Promise.resolve([]),
  fetchProcessNextSteps: () => Promise.resolve([]),
};

const unMockableQueriesDefaults: UnMockableQueries = {
  fetchInstanceData: () => Promise.reject(new Error('fetchInstanceData not mocked')),
  fetchProcessState: () => Promise.reject(new Error('fetchProcessState not mocked')),
  fetchLayoutSettings: () => Promise.reject(new Error('fetchLayoutSettings not mocked')),
  fetchLayouts: () => Promise.reject(new Error('fetchLayouts not mocked')),
};

const renderBase = async ({
  renderer,
  router,
  queries = {},
  waitUntilLoaded = true,
  unMockableQueries = {},
  reduxState,
  reduxGateKeeper,
  ...renderOptions
}: BaseRenderOptions) => {
  const state = reduxState || getInitialStateMock();
  const { store } = setupStore(state);
  const originalDispatch = store.dispatch;
  jest.spyOn(store, 'dispatch').mockImplementation((action) => {
    if (!reduxGateKeeper) {
      return undefined;
    }

    return reduxGateKeeper(action) ? originalDispatch(action) : undefined;
  });

  function ComponentToTest() {
    return <>{renderer()}</>;
  }

  function DefaultRouter({ children }: PropsWithChildren) {
    return (
      <MemoryRouter>
        <Routes>
          <Route
            path={'/'}
            element={children}
          />
        </Routes>
      </MemoryRouter>
    );
  }

  function Providers() {
    const theme = createTheme(AltinnAppTheme);

    const allQueries = {
      ...defaultQueryMocks,
      ...queries,
      ...unMockableQueriesDefaults,
      ...unMockableQueries,
      ...mutationsMap(mutations),
    };

    const RealRouter = router || DefaultRouter;
    return (
      <AppQueriesProvider {...allQueries}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <ExprContextWrapper>
              <RealRouter>
                <InstantiationProvider>
                  <ComponentToTest />
                </InstantiationProvider>
              </RealRouter>
            </ExprContextWrapper>
          </Provider>
        </MuiThemeProvider>
      </AppQueriesProvider>
    );
  }

  const utils = {
    store,
    mutations,
    ...rtlRender(Providers(), renderOptions),
  };

  if (waitUntilLoaded) {
    // This may fail early if any of the providers fail to load, and will give you the provider/reason for failure
    await waitFor(() => {
      const reason = utils.queryByTestId('loader')?.getAttribute('data-reason');
      const asText = `Reason for loading: ${reason}`;
      expect(asText).toEqual('Reason for loading: undefined');
    });

    // This is a little broader, as it will catch both the loading state
    // in renderGenericComponentTest() below, but also the <Loader /> component.
    await waitFor(() => expect(utils.queryByText('Loading...')).not.toBeInTheDocument());

    // This also catches any AltinnSpinner components inside the DOM
    await waitFor(() => expect(utils.queryByTestId('altinn-spinner')).not.toBeInTheDocument());

    // Clear the dispatch mock, as the app might trigger actions while loading
    (store.dispatch as jest.Mock).mockClear();
  }

  return utils;
};

export const renderWithoutInstanceAndLayout = async (props: ExtendedRenderOptions) => await renderBase(props);
export const renderWithInstanceAndLayout = async ({
  renderer,
  reduxState: _reduxState,
  ...renderOptions
}: Omit<ExtendedRenderOptions, 'router'>) => {
  const reduxState = _reduxState || getInitialStateMock();
  let foundComponents = false;
  const layouts = JSON.parse(JSON.stringify(reduxState.formLayout.layouts || {})) as ILayouts;
  const layoutsAsCollection: ILayoutCollection = {};
  for (const key in layouts) {
    if (layouts[key]?.length) {
      foundComponents = true;
    }

    layoutsAsCollection[key] = {
      data: {
        layout: layouts[key] || [],
      },
    };
  }

  if (!foundComponents) {
    throw new Error('No components found, maybe you want to test with renderWithoutInstanceAndLayout() instead?');
  }

  function InstanceRouter({ children }: PropsWithChildren) {
    return (
      <MemoryRouterWithRedirectingRoot to={`instance/${exampleInstanceId}`}>
        <Route
          path={'instance/:partyId/:instanceGuid'}
          element={children}
        />
      </MemoryRouterWithRedirectingRoot>
    );
  }

  return await renderBase({
    renderer: () => (
      <InstanceProvider provideLayoutValidation={false}>
        <WaitForNodes waitForAllNodes={true}>{renderer()}</WaitForNodes>
      </InstanceProvider>
    ),
    unMockableQueries: {
      fetchInstanceData: () => Promise.resolve(reduxState.deprecated.lastKnownInstance || getInstanceDataMock()),
      fetchProcessState: () => Promise.resolve(reduxState.deprecated.lastKnownProcess || getProcessDataMock()),
      fetchLayoutSettings: () =>
        Promise.resolve({
          pages: {
            order: Object.keys(layouts),
          },
        }),
      fetchLayouts: () => Promise.resolve(layoutsAsCollection),
    },
    router: InstanceRouter,
    reduxState,
    ...renderOptions,
  });
};

const WaitForNodes = ({
  children,
  waitForAllNodes,
  nodeId,
}: PropsWithChildren<{ waitForAllNodes: boolean; nodeId?: string }>) => {
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const currentView = useAppSelector((state) => state.formLayout.uiConfig.currentView);
  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const nodes = useExprContext();

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

  const waitingForString = waitingFor.join(', ');
  if (waitingForString && waitForAllNodes) {
    return (
      <>
        <div>Loading...</div>
        <div>Waiting for {waitingForString}</div>
      </>
    );
  }

  if (!nodes && waitForAllNodes) {
    return (
      <>
        <div>Loading...</div>
        <div>Waiting for nodes</div>
      </>
    );
  }

  if (nodeId !== undefined && nodes && waitForAllNodes) {
    const node = nodes.findById(nodeId);
    if (!node) {
      return (
        <>
          <div>Unable to find target node: {nodeId}</div>
          <div>All other nodes loaded:</div>
          <ul>
            {nodes.allNodes().map((node) => (
              <li key={node.item.id}>{node.item.id}</li>
            ))}
          </ul>
        </>
      );
    }
  }

  return <>{children}</>;
};

export interface RenderWithNodeTestProps<T extends LayoutNode> extends Omit<ExtendedRenderOptions, 'renderer'> {
  renderer: (props: { node: T; root: LayoutPages }) => React.ReactElement;
  nodeId: string;
}

export async function renderWithNode<T extends LayoutNode = LayoutNode>(
  props: RenderWithNodeTestProps<T>,
): Promise<ReturnType<typeof renderWithInstanceAndLayout>> {
  const reduxState = props.reduxState || getInitialStateMock();
  if (!reduxState.formLayout.layouts) {
    throw new Error('No layouts found, cannot render with nodes when no layout is in the redux state');
  }

  // The repeating groups state is required for nodes to work
  reduxState.formLayout.uiConfig.repeatingGroups =
    reduxState.formLayout.uiConfig.repeatingGroups || generateSimpleRepeatingGroups(reduxState.formLayout.layouts);

  function Child() {
    const root = useExprContext();

    if (!root) {
      return <div>Unable to find root context</div>;
    }

    const node = root.findById(props.nodeId);
    if (!node) {
      return <div>Unable to find node: {props.nodeId}</div>;
    }
    return props.renderer({ node: node as T, root });
  }

  return renderWithInstanceAndLayout({
    ...props,
    reduxState,
    renderer: () => (
      <WaitForNodes
        waitForAllNodes={true}
        nodeId={props.nodeId}
      >
        <Child />
      </WaitForNodes>
    ),
  });
}

export interface RenderGenericComponentTestProps<T extends CompTypes> {
  type: T;
  renderer: (props: PropsFromGenericComponent<T>) => JSX.Element;
  component?: Partial<CompExternalExact<T>>;
  genericProps?: Partial<PropsFromGenericComponent<T>>;
  reduxState?: IRuntimeState;
  reduxGateKeeper?: (action: any) => boolean;
  queries?: Partial<AppQueriesContext>;
  waitUntilLoaded?: boolean;
}

export async function renderGenericComponentTest<T extends CompTypes>({
  type,
  renderer,
  component,
  genericProps,
  reduxState: _reduxState,
  reduxGateKeeper,
  queries,
}: RenderGenericComponentTestProps<T>) {
  const realComponentDef = {
    id: 'my-test-component-id',
    type,
    ...component,
  } as any;

  const reduxState = _reduxState || getInitialStateMock();
  if (!reduxState.formLayout.layouts) {
    throw new Error('No layouts found, cannot render generic component when no layout is in the redux state');
  }
  const firstLayout = Object.keys(reduxState.formLayout.layouts)[0];
  if (!firstLayout) {
    throw new Error('No layouts found, cannot render generic component when no layout is in the redux state');
  }

  reduxState.formLayout.layouts[firstLayout]!.push(realComponentDef);

  const Wrapper = ({ node }: { node: LayoutNode<T> }) => {
    const props: PropsFromGenericComponent<T> = {
      node,
      ...(mockGenericComponentProps as unknown as IComponentProps<T>),
      ...genericProps,
    };

    return renderer(props);
  };

  return renderWithNode<LayoutNode<T>>({
    reduxState,
    reduxGateKeeper,
    queries,
    nodeId: realComponentDef.id,
    renderer: Wrapper,
  });
}

const mockGenericComponentProps: IComponentProps<CompTypes> = {
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
