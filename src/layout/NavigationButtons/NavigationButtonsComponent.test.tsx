import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { screen } from '@testing-library/react';

import { getFormLayoutStateMock } from 'src/__mocks__/formLayoutStateMock';
import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { NavigationButtonsComponent } from 'src/layout/NavigationButtons/NavigationButtonsComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { CompNavigationButtonsExternal } from 'src/layout/NavigationButtons/config.generated';
import type { RenderGenericComponentTestProps } from 'src/test/renderWithProviders';

const NavigationRouter =
  (currentPageId: string = 'layout1') =>
  // eslint-disable-next-line react/display-name
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter
      basename={'/ttd/test'}
      initialEntries={[`/ttd/test/instance/1337/dfe95272-6873-48a6-abae-57b3f7c18689/Task_1/${currentPageId}`]}
    >
      <Routes>
        <Route
          path={'instance/:partyId/:instanceGuid/*'}
          element={children}
        />
      </Routes>
    </MemoryRouter>
  );

describe('NavigationButtons', () => {
  const navButton1: CompNavigationButtonsExternal = {
    id: 'nav-button1',
    type: 'NavigationButtons',
    textResourceBindings: {},
  };
  const navButton2: CompNavigationButtonsExternal = {
    id: 'nav-button2',
    type: 'NavigationButtons',
    textResourceBindings: {},
  };

  const mockLayout = getFormLayoutStateMock({
    layouts: {
      layout1: [
        {
          type: 'Input',
          id: 'mockId1',
          dataModelBindings: {
            simpleBinding: 'mockDataBinding1',
          },
          readOnly: false,
          required: false,
          textResourceBindings: {},
        },
        navButton1,
      ],
      layout2: [
        {
          type: 'Input',
          id: 'mockId2',
          dataModelBindings: {
            simpleBinding: 'mockDataBinding2',
          },
          readOnly: false,
          required: false,
          textResourceBindings: {},
        },
        navButton2,
      ],
    },
    uiConfig: {
      currentView: 'layout1',
      focus: null,
      hiddenFields: [],
      repeatingGroups: {},
      pageOrderConfig: {
        order: ['layout1', 'layout2'],
        hidden: [],
        hiddenExpr: {},
      },
      excludePageFromPdf: [],
      excludeComponentFromPdf: [],
    },
  });

  const render = async (
    { component, genericProps }: Partial<RenderGenericComponentTestProps<'NavigationButtons'>> = {},
    currentPageId?: string,
  ) => {
    await renderGenericComponentTest({
      type: 'NavigationButtons',
      renderer: (props) => <NavigationButtonsComponent {...props} />,
      component,
      genericProps,
      reduxState: getInitialStateMock((state) => {
        state.formLayout = mockLayout;
      }),
      queries: {
        fetchLayoutSets: () => Promise.resolve({ sets: [{ dataType: 'message', id: 'message', tasks: ['Task_1'] }] }),
        fetchLayoutSettings: () => Promise.resolve({ pages: { order: ['layout1', 'layout2'] } }),
      },
      router: NavigationRouter(currentPageId),
    });
  };

  test('renders default NavigationButtons component', async () => {
    navButton1.showBackButton = false;
    await render({
      component: {
        id: navButton1.id,
      },
    });

    expect(screen.getByText('next')).toBeInTheDocument();
    expect(screen.queryByText('back')).toBeFalsy();
  });

  test('renders NavigationButtons component without back button if there is no previous page', async () => {
    navButton1.showBackButton = true;
    await render({
      component: {
        id: navButton1.id,
      },
    });

    expect(screen.getByText('next')).toBeInTheDocument();
    expect(screen.queryByText('back')).toBeNull();
  });

  test('renders NavigationButtons component with back button if there is a previous page', async () => {
    await render(
      {
        component: {
          id: navButton2.id,
          showBackButton: true,
        },
      },
      'layout2',
    );

    expect(screen.getByText('back')).toBeInTheDocument();
  });
});
