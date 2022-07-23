import React, { type PropsWithChildren, useState } from 'react';
import {
  type RouterProps,
  Link,
  MemoryRouter,
  Route,
  Switch,
  useHistory,
  useLocation,
} from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAppDispatch } from 'src/common/hooks/useAppDispatch';
import { useFormLayoutHistoryAndMatchInstanceLocation } from 'src/common/hooks/useFormLayoutHistory';

jest.mock('./useAppDispatch');
describe('useFormLayoutHistory', () => {
  const instanceIdExample = '123456/75154373-aed4-41f7-95b4-e5b5115c2edc';
  let setViewFunc: (arg: string) => void;
  let browserHistory: RouterProps['history'];
  let dispatchFunction: jest.Mock;
  beforeEach(() => {
    dispatchFunction = jest.fn(
      ({ payload: { newView } }: { payload: { newView: string } }) => {
        setViewFunc(newView);
      },
    );
    (useAppDispatch as jest.Mock).mockImplementation(() => dispatchFunction);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  const setBrowserHistory = (h: RouterProps['history']) => {
    browserHistory = h;
  };

  const MockPage = function ({
    children,
    prevPage,
    nextPage,
  }: PropsWithChildren<{
    prevPage?: string;
    nextPage?: string;
  }>) {
    return (
      <div>
        <header>{window.location.pathname}</header>
        <main>{children}</main>
        <footer>
          {prevPage && (
            <button onClick={() => setViewFunc(prevPage)}>Prev</button>
          )}
          {nextPage && (
            <button onClick={() => setViewFunc(nextPage)}>Next</button>
          )}
          {nextPage && <Link to={nextPage}>Next</Link>}
        </footer>
      </div>
    );
  };
  const MockRouteLayout = function ({ currentView }: { currentView: string }) {
    const location = useLocation();
    const { matchRootUrl } = useFormLayoutHistoryAndMatchInstanceLocation({
      activePageId: currentView,
    });
    return (
      <>
        <div>
          <button onClick={browserHistory.goBack}>History back</button>
          <button onClick={browserHistory.goForward}>History forward</button>
          <p>location {location.pathname}</p>
          <p>match {matchRootUrl}</p>
          <p>currentView {currentView}</p>
        </div>
        <Route
          exact
          path={`${matchRootUrl}/page1`}
        >
          <MockPage nextPage={'page2'}>First route</MockPage>
        </Route>
        <Route
          exact
          path={`${matchRootUrl}/page2`}
        >
          <MockPage
            prevPage={'page1'}
            nextPage={'page3'}
          >
            Second route
          </MockPage>
        </Route>
        <Route
          exact
          path={`${matchRootUrl}/page3`}
        >
          <MockPage
            prevPage={'page2'}
            nextPage={'page4'}
          >
            Third route
          </MockPage>
        </Route>
        <Route
          exact
          path={`${matchRootUrl}/page4`}
        >
          <MockPage prevPage={'page3'}>
            Fourth route
            <button onClick={() => browserHistory.go(-3)}>
              History 3 back
            </button>
          </MockPage>
        </Route>
      </>
    );
  };

  function TheSwitch({ currentView }: { currentView: string }) {
    const history = useHistory();
    setBrowserHistory(history);
    return (
      <Switch>
        <Route
          path='/instance/:partyId/:instanceGuid/:pageId'
          exact
        >
          <MockRouteLayout currentView={currentView} />
        </Route>
        <Route
          path='/instance/:partyId/:instanceGuid'
          exact
        >
          <MockRouteLayout currentView={currentView} />
        </Route>
        <Route
          path={'/:pageId'}
          exact
        >
          <MockRouteLayout currentView={currentView} />
        </Route>
        <Route
          path={''}
          exact
        >
          <MockRouteLayout currentView={currentView} />
        </Route>
      </Switch>
    );
  }

  function Everything({
    defaultPage,
    initialEntries,
  }: {
    defaultPage: string;
    initialEntries?: string[];
  }) {
    const [currentView, setCurrentView] = useState(defaultPage);
    setViewFunc = setCurrentView;
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <TheSwitch currentView={currentView} />
      </MemoryRouter>
    );
  }

  const renderLayout = (defaultPage = '', initialEntries) => {
    render(
      <Everything
        defaultPage={defaultPage}
        initialEntries={initialEntries}
      />,
    );
  };
  const NEXT_BUTTON = () => screen.getByRole('button', { name: /next/i });
  const PREV_BUTTON = () => screen.getByRole('button', { name: /prev/i });
  const NEXT_LINK = () => screen.getByRole('link', { name: /next/i });

  const BROWSER_BACK = () =>
    screen.getByRole('button', { name: /History back/i });
  const BROWSER_FORWARD = () =>
    screen.getByRole('button', { name: /History forward/i });
  describe('initialRoute=""', () => {
    const commonTests = (expectedLocation: string) => {
      expect(screen.getByText('currentView page1')).toBeInTheDocument();
      expect(screen.getByText('First route')).toBeInTheDocument();
      expect(
        screen.getByText(`location ${expectedLocation}`),
      ).toBeInTheDocument();
    };
    test('should direct the user to the "activePage" when user has instanceId', async () => {
      renderLayout('page1', [`/instance/${instanceIdExample}`]);
      commonTests(`/instance/${instanceIdExample}/page1`);
    });
    test('should direct to the "activePage" without instance', async () => {
      renderLayout('page1', ['']);
      commonTests('/page1');
    });
  });

  describe('initialRoute="/page3" (direct link to form layout page)', () => {
    const commonTests = (baseUrl) => {
      renderLayout('', [`${baseUrl}page3`]);
      expect(dispatchFunction).toHaveBeenCalled();
      expect(screen.getByText('currentView page3')).toBeInTheDocument();
      expect(screen.getByText('Third route')).toBeInTheDocument();
      expect(screen.getByText(`location ${baseUrl}page3`)).toBeInTheDocument();
      expect(browserHistory.length).toBe(1);
    };
    test('should work with instanceId', async () => {
      const baseUrl = `/instance/${instanceIdExample}/`;
      commonTests(baseUrl);
    });
    test('should work without instanceId ', async () => {
      const baseRoute = `/`;
      commonTests(baseRoute);
    });
  });

  describe('directing the user to a default page in the form', () => {
    const commonTests = (baseUrl) => {
      renderLayout('page4', [`${baseUrl}page2`]);
      expect(screen.getByText('currentView page4')).toBeInTheDocument();
      expect(screen.getByText('Fourth route')).toBeInTheDocument();
      expect(screen.getByText(`location ${baseUrl}page4`)).toBeInTheDocument();
    };
    test('should work with InstanceId', async () => {
      const baseUrl = `/instance/${instanceIdExample}/`;
      commonTests(baseUrl);
    });
    test('should work without InstanceId', async () => {
      const baseUrl = `/`;
      commonTests(baseUrl);
    });
  });
  describe('vigorous navigation', () => {
    const commonTests = async (baseUrl) => {
      renderLayout('page1', [baseUrl]);
      const user = userEvent.setup();
      expect(screen.getByText('currentView page1')).toBeInTheDocument();
      expect(screen.getByText('First route')).toBeInTheDocument();
      expect(browserHistory.length).toBe(1);
      await user.click(NEXT_BUTTON());
      expect(screen.getByText('currentView page2')).toBeInTheDocument();
      expect(screen.getByText('Second route')).toBeInTheDocument();
      await user.click(NEXT_BUTTON());
      expect(screen.getByText('currentView page3')).toBeInTheDocument();
      expect(screen.getByText('Third route')).toBeInTheDocument();
      await user.click(NEXT_BUTTON());
      expect(screen.getByText('currentView page4')).toBeInTheDocument();
      expect(screen.getByText('Fourth route')).toBeInTheDocument();
      await user.click(PREV_BUTTON());
      expect(screen.getByText('currentView page3')).toBeInTheDocument();
      expect(screen.getByText('Third route')).toBeInTheDocument();
      expect(browserHistory.length).toBe(5);
      await user.click(BROWSER_BACK());
      expect(dispatchFunction).toHaveBeenCalledWith({
        payload: { newView: 'page4' },
        type: 'formLayout/updateCurrentView',
      });
      expect(screen.getByText('currentView page4')).toBeInTheDocument();
      await user.click(BROWSER_BACK());
      expect(screen.getByText('currentView page3')).toBeInTheDocument();
      await user.click(BROWSER_BACK());
      expect(screen.getByText('currentView page2')).toBeInTheDocument();
      expect(screen.getByText('Second route')).toBeInTheDocument();
      expect(browserHistory.length).toBe(5); // history should be the same
      await user.click(PREV_BUTTON());
      expect(browserHistory.length).toBe(3); // history should change on new entry
      await user.click(NEXT_BUTTON());
      await user.click(NEXT_BUTTON());
      await user.click(NEXT_BUTTON());
      expect(screen.getByText('currentView page4')).toBeInTheDocument();
      expect(screen.getByText('Fourth route')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'History 3 back' }));
      expect(screen.getByText('currentView page1')).toBeInTheDocument();
      expect(screen.getByText('First route')).toBeInTheDocument();
      expect(browserHistory.length).toBe(6);
      await user.click(BROWSER_FORWARD());
      expect(screen.getByText('currentView page2')).toBeInTheDocument();
      expect(screen.getByText('Second route')).toBeInTheDocument();
      await user.click(BROWSER_FORWARD());
      await user.click(BROWSER_FORWARD());
      expect(screen.getByText('currentView page4')).toBeInTheDocument();
      expect(screen.getByText('Fourth route')).toBeInTheDocument();
    };
    test('should work with InstanceId', async () => {
      const baseUrl = `/instance/${instanceIdExample}`;
      await commonTests(baseUrl);
    });
    test('should work without instance', async () => {
      const baseUrl = ``;
      await commonTests(baseUrl);
    });
  });
  describe('navigate from a random page inside the form', () => {
    const commonTests = async (baseUrl) => {
      renderLayout('', [`${baseUrl}page3`]);
      const user = userEvent.setup();
      expect(screen.getByText('currentView page3')).toBeInTheDocument();
      expect(screen.getByText('Third route')).toBeInTheDocument();
      await user.click(PREV_BUTTON());
      expect(screen.getByText('currentView page2')).toBeInTheDocument();
      expect(screen.getByText('Second route')).toBeInTheDocument();
      expect(browserHistory.length).toBe(2);
      await user.click(NEXT_LINK());
      expect(dispatchFunction).toHaveBeenCalled();
      expect(screen.getByText(`location ${baseUrl}page3`)).toBeInTheDocument();
    };
    test('should work with InstanceId', async () => {
      const baseUrl = `/instance/${instanceIdExample}/`;
      await commonTests(baseUrl);
    });
    test('should work without instance', async () => {
      const baseUrl = `/`;
      await commonTests(baseUrl);
    });
  });
});
