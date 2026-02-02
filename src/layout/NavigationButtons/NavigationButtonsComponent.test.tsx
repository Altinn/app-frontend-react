import React from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { defaultDataTypeMock } from 'src/__mocks__/getLayoutSetsMock';
import { PageValidation } from 'src/layout/common.generated';
import { NavigationButtonsComponent } from 'src/layout/NavigationButtons/NavigationButtonsComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { CompNavigationButtonsExternal } from 'src/layout/NavigationButtons/config.generated';
import type { RenderGenericComponentTestProps } from 'src/test/renderWithProviders';

interface RenderProps extends Omit<Partial<RenderGenericComponentTestProps<'NavigationButtons'>>, 'component'> {
  component: CompNavigationButtonsExternal;
  currentPageId?: 'layout1' | 'layout2';
  pageValidation?: PageValidation;
  formDataOverride?: () => Promise<Record<string, unknown>>;
  schemaOverride?: () => Promise<Record<string, unknown>>;
  inputRequired?: boolean; // Add this to check validation scenarios on navigation
}

describe('NavigationButtons', () => {
  const navButton1: CompNavigationButtonsExternal = {
    id: 'nav-button1',
    type: 'NavigationButtons',
    textResourceBindings: {},
  };
  const navButton2: CompNavigationButtonsExternal = {
    id: 'nav-button2',
    type: 'NavigationButtons',
    showBackButton: true,
    textResourceBindings: {},
  };
  const navButton3: CompNavigationButtonsExternal = {
    id: 'nav-button3',
    type: 'NavigationButtons',
    showBackButton: true,
    textResourceBindings: {},
    validateOnNext: { page: 'all', show: ['CustomBackend'] },
  };

  const render = async ({
    component,
    genericProps,
    currentPageId = 'layout1',
    pageValidation,
    formDataOverride,
    schemaOverride,
    inputRequired = false,
  }: RenderProps) => {
    const baseQueries = {
      fetchLayoutSets: async () => ({ sets: [{ dataType: 'test-data-model', id: 'message', tasks: ['Task_1'] }] }),
      fetchLayoutSettings: async () => ({ pages: { order: ['layout1', 'layout2'] } }),
    };

    return await renderGenericComponentTest({
      type: 'NavigationButtons',
      renderer: (props) => <NavigationButtonsComponent {...props} />,
      component,
      genericProps,
      initialPage: currentPageId,
      queries: {
        ...baseQueries,
        ...(formDataOverride && { fetchFormData: formDataOverride }),
        ...(schemaOverride && { fetchDataModelSchema: schemaOverride }),
        fetchLayouts: async () => ({
          layout1: {
            data: {
              layout: [
                {
                  type: 'Input',
                  id: 'mockId1',
                  dataModelBindings: {
                    simpleBinding: { dataType: defaultDataTypeMock, field: 'mockDataBinding1' },
                  },
                  readOnly: false,
                  required: inputRequired,
                  textResourceBindings: {},
                },
                ...(currentPageId === 'layout1' ? [component] : []),
              ],
              ...(pageValidation && { validationOnNavigation: pageValidation }),
            },
          },
          layout2: {
            data: {
              layout: [
                {
                  type: 'Input',
                  id: 'mockId2',
                  dataModelBindings: {
                    simpleBinding: { dataType: defaultDataTypeMock, field: 'mockDataBinding2' },
                  },
                  readOnly: false,
                  required: inputRequired,
                  textResourceBindings: {},
                },
                ...(currentPageId === 'layout2' ? [component] : []),
              ],
            },
          },
        }),
      },
    });
  };

  test('renders default NavigationButtons component', async () => {
    await render({
      component: navButton1,
    });

    expect(await screen.findByText('next')).toBeInTheDocument();
    expect(screen.queryByText('back')).not.toBeInTheDocument();
  });

  test('renders NavigationButtons component without back button if there is no previous page', async () => {
    await render({
      component: navButton2,
    });

    expect(screen.getByText('next')).toBeInTheDocument();
    expect(screen.queryByText('back')).toBeNull();
  });

  test('renders NavigationButtons component with back button if there is a previous page', async () => {
    await render({ component: navButton2, currentPageId: 'layout2' });

    expect(screen.getByText('back')).toBeInTheDocument();
  });

  test('uses page validation when button has no validation config', async () => {
    await render({
      component: navButton1,
      pageValidation: { page: 'current', show: ['Required'] },
      formDataOverride: async () => ({}),
      inputRequired: true,
    });

    await userEvent.click(screen.getByText('next'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.getByText('next')).toBeInTheDocument();
  });

  test('button validation overrides page validation', async () => {
    await render({
      component: navButton3,
      pageValidation: { page: 'current', show: ['Required'] },
      formDataOverride: async () => ({}),
      inputRequired: true,
    });

    await userEvent.click(screen.getByText('next'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.queryByText('next')).not.toBeInTheDocument();
  });
});
