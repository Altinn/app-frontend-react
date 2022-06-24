import React from 'react';
import { PreloadedState } from 'redux';
import { renderWithProviders } from 'src/../testUtils';
import { getInitialStateMock } from '__mocks__/initialStateMock';
import { IPanelGroupContainerProps, PanelGroupContainer } from './PanelGroupContainer';
import type { RootState } from 'src/store';
import { ILayout, ILayoutGroup } from '../layout';
import { ILayoutState } from '../layout/formLayoutSlice';
import { screen } from '@testing-library/react';
import { IUiConfig } from 'src/types';

describe('PanelGroupContainer', () => {
  const container: ILayoutGroup = {
    id: 'group-id',
    type: 'Group',
    children: ['input-1', 'input-2'],
    panel: {
      variant: 'info'
    },
  };

  const groupComponents: ILayout = [
    {
      id: 'input-1',
      type: 'Input',
      dataModelBindings: {
        simple: 'something',
      },
      textResourceBindings: {
        title: 'Title for first input',
      },
      readOnly: false,
      required: false,
      disabled: false,
    },
    {
      id: 'input-2',
      type: 'Input',
      dataModelBindings: {
        simple: 'something.else',
      },
      textResourceBindings: {
        title: 'Title for second input',
      },
      readOnly: false,
      required: false,
      disabled: false,
    },
  ];

  const state: PreloadedState<RootState> = {
    formLayout: {
      layouts: {
        FormLayout: [container, ...groupComponents],
      },
      uiConfig: {
        hiddenFields: [],
        currentView: 'FormLayout'
      } as IUiConfig,
      error: null,
      layoutsets: null
    } as ILayoutState,
  };

  it('should render panel with group children', async () => {
    render(
      {
        container,
        components: groupComponents
      },
      state,
    );

    screen.debug();

    const groupPanel = await screen.queryByTestId('panel-group-container');
    expect(groupPanel).toBeInTheDocument();

    const firstInputTitle = await screen.queryByText('Title for first input');
    expect(firstInputTitle).toBeInTheDocument();

    const secondInputTitle = await screen.queryByText('Title for second input');
    expect(secondInputTitle).toBeInTheDocument();
  });

  it('should render nothing if group is hidden', async () => {
    const stateWithHidden: PreloadedState<RootState> = {
      formLayout: {
        ...state.formLayout,
        uiConfig: {
          ...state.formLayout.uiConfig,
          hiddenFields: ['group-id']
        } as IUiConfig,
      }
    };

    render(
      {
        container,
        components: groupComponents
      },
      stateWithHidden,
    );

    const groupPanel = await screen.queryByTestId('panel-group-container');
    expect(groupPanel).not.toBeInTheDocument();
  });
});

const render = (
  props: Partial<IPanelGroupContainerProps> = {},
  customState: PreloadedState<RootState> = {},
) => {
  const allProps: IPanelGroupContainerProps = {
    ...({} as IPanelGroupContainerProps),
    ...props,
  };

  const { container } = renderWithProviders(
    <PanelGroupContainer {...allProps} />,
    {
      preloadedState: {
        ...getInitialStateMock(),
        ...customState
      },
    },
  );

  return container;
}
