import React from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { PayloadAction } from '@reduxjs/toolkit';

import { getFormLayoutGroupMock } from 'src/__mocks__/getFormLayoutGroupMock';
import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { Triggers } from 'src/layout/common.generated';
import { GroupContainer } from 'src/layout/Group/GroupContainer';
import { mockMediaQuery } from 'src/test/mockMediaQuery';
import { renderWithNode } from 'src/test/renderWithProviders';
import type { ILayoutState } from 'src/features/form/layout/formLayoutSlice';
import type { IUpdateRepeatingGroupsEditIndex } from 'src/features/form/layout/formLayoutTypes';
import type { CompGroupRepeatingExternal, CompGroupRepeatingInternal } from 'src/layout/Group/config.generated';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';
import type { CompExternal } from 'src/layout/layout';

const mockContainer = getFormLayoutGroupMock();

interface IRender {
  container?: CompGroupRepeatingExternal;
}

async function render({ container = mockContainer }: IRender = {}) {
  const mockComponents: CompExternal[] = [
    {
      id: 'field1',
      type: 'Input',
      dataModelBindings: {
        simpleBinding: 'Group.prop1',
      },
      textResourceBindings: {
        title: 'Title1',
      },
      readOnly: false,
      required: false,
    },
    {
      id: 'field2',
      type: 'Input',
      dataModelBindings: {
        simpleBinding: 'Group.prop2',
      },
      textResourceBindings: {
        title: 'Title2',
      },
      readOnly: false,
      required: false,
    },
    {
      id: 'field3',
      type: 'Input',
      dataModelBindings: {
        simpleBinding: 'Group.prop3',
      },
      textResourceBindings: {
        title: 'Title3',
      },
      readOnly: false,
      required: false,
    },
    {
      id: 'field4',
      type: 'Checkboxes',
      dataModelBindings: {
        simpleBinding: 'some-group.checkboxBinding',
      },
      textResourceBindings: {
        title: 'Title4',
      },
      readOnly: false,
      required: false,
      options: [{ value: 'option.value', label: 'option.label' }],
    },
  ];

  const group = getFormLayoutGroupMock({
    ...container,
    dataModelBindings: {
      group: 'Group',
    },
  });

  const initialMock = getInitialStateMock();
  const mockLayout: ILayoutState = {
    ...initialMock.formLayout,
    layouts: {
      FormLayout: [group, ...mockComponents],
    },
    uiConfig: {
      ...initialMock.formLayout.uiConfig,
      repeatingGroups: {
        'container-closed-id': {
          index: 3,
          editIndex: -1,
        },
        'container-in-edit-mode-id': {
          index: 4,
          editIndex: 0,
        },
      },
      currentView: 'FormLayout',
    },
  };

  const mockData = {
    formData: {
      'some-group[1].checkboxBinding': 'option.value',
    },
  } as any;

  const reduxState = getInitialStateMock({
    formLayout: mockLayout,
    formData: mockData,
  });

  const { store } = await renderWithNode<LayoutNodeForGroup<CompGroupRepeatingInternal>>({
    renderer: ({ node }) => <GroupContainer node={node} />,
    nodeId: container.id,
    reduxState,
    queries: {
      fetchTextResources: () =>
        Promise.resolve({
          language: 'en',
          resources: [
            { id: 'option.label', value: 'Value to be shown' },
            { id: 'button.open', value: 'New open text' },
            { id: 'button.close', value: 'New close text' },
            { id: 'button.save', value: 'New save text' },
          ],
        }),
    },
  });

  return store;
}

const { setScreenWidth } = mockMediaQuery(992);

describe('GroupContainer', () => {
  beforeAll(() => {
    // Set screen size to desktop
    setScreenWidth(1200);
  });

  it('should render add new button with custom label when supplied', async () => {
    const mockContainerWithLabel: CompGroupRepeatingExternal = {
      textResourceBindings: {
        add_button: 'person',
      },
      ...mockContainer,
    };
    await render({ container: mockContainerWithLabel });
    await waitFor(() => {
      const item = screen.getByText('Legg til ny person');
      expect(item).toBeInTheDocument();
    });
  });

  it('should not show add button when maxOccurs is reached', async () => {
    const mockContainerWithMaxCount = {
      ...mockContainer,
      maxCount: 3,
    };
    await render({ container: mockContainerWithMaxCount });

    const addButton = screen.queryByText('Legg til ny');
    expect(addButton).not.toBeInTheDocument();
  });

  it('should show option label when displaying selection components', async () => {
    await render({ container: getFormLayoutGroupMock({ id: 'container-in-edit-mode-id' }) });

    const item = screen.getByText('Value to be shown');
    expect(item).toBeInTheDocument();
  });

  it('calls setMultiPageIndex when adding a group element', async () => {
    const user = userEvent.setup();
    const multiPageContainer: CompGroupRepeatingExternal = {
      ...mockContainer,
      edit: {
        ...mockContainer.edit,
        multiPage: true,
      },
      children: ['0:field1', '0:field2', '1:field3', '1:field4'],
    };
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const store = await render({ container: multiPageContainer });

    const addButton = screen.getAllByRole('button', {
      name: /Legg til ny/i,
    })[0];
    await user.click(addButton);

    const mockDispatchedAction: PayloadAction<Parameters<typeof FormLayoutActions.repGroupSetMultiPage>[0]> = {
      payload: {
        groupId: 'container-closed-id',
        page: 0,
      },
      type: FormLayoutActions.repGroupSetMultiPage.type,
    };

    expect(store.dispatch).toHaveBeenLastCalledWith(mockDispatchedAction);
  });

  it('should trigger validate when closing edit mode if validation trigger is present', async () => {
    const mockContainerInEditModeWithTrigger = {
      ...mockContainer,
      id: 'container-in-edit-mode-id',
      triggers: [Triggers.Validation],
    };
    const user = userEvent.setup();
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const store = await render({ container: mockContainerInEditModeWithTrigger });

    const editButton = screen.getAllByRole('button', {
      name: /Lagre og lukk/i,
    })[0];
    await user.click(editButton);

    const mockDispatchedAction: PayloadAction<IUpdateRepeatingGroupsEditIndex> = {
      payload: {
        group: 'container-in-edit-mode-id',
        index: -1,
        // validate: Triggers.Validation,
      },
      type: FormLayoutActions.updateRepeatingGroupsEditIndex.type,
    };

    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(mockDispatchedAction);
  });

  it('should NOT trigger validate when closing edit mode if validation trigger is NOT present', async () => {
    const mockContainerInEditMode = {
      ...mockContainer,
      id: 'container-in-edit-mode-id',
    };
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const store = await render({ container: mockContainerInEditMode });
    const user = userEvent.setup();

    const editButton = screen.getAllByRole('button', {
      name: /Lagre og lukk/i,
    })[0];
    await act(() => user.click(editButton));

    const mockDispatchedAction: PayloadAction<IUpdateRepeatingGroupsEditIndex> = {
      payload: {
        group: 'container-in-edit-mode-id',
        index: -1,
      },
      type: FormLayoutActions.updateRepeatingGroupsEditIndex.type,
    };

    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(mockDispatchedAction);
  });

  it('should trigger validate when saving if validation trigger is present', async () => {
    const mockContainerInEditModeWithTrigger = {
      ...mockContainer,
      id: 'container-in-edit-mode-id',
      triggers: [Triggers.Validation],
    };
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const store = await render({ container: mockContainerInEditModeWithTrigger });
    const user = userEvent.setup();

    const editButton = screen.getAllByRole('button', {
      name: /Lagre og lukk/i,
    })[1];
    await act(() => user.click(editButton));

    const mockDispatchedAction: PayloadAction<IUpdateRepeatingGroupsEditIndex> = {
      payload: {
        group: 'container-in-edit-mode-id',
        index: -1,
        // validate: Triggers.Validation,
      },
      type: FormLayoutActions.updateRepeatingGroupsEditIndex.type,
    };

    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(mockDispatchedAction);
  });

  it('should trigger validate when saving if validateRow trigger is present', async () => {
    const mockContainerInEditModeWithTrigger = {
      ...mockContainer,
      id: 'container-in-edit-mode-id',
      triggers: [Triggers.ValidateRow],
    };
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const store = await render({ container: mockContainerInEditModeWithTrigger });
    const user = userEvent.setup();

    const editButton = screen.getAllByRole('button', {
      name: /Lagre og lukk/i,
    })[1];
    await act(() => user.click(editButton));

    const mockDispatchedAction: PayloadAction<IUpdateRepeatingGroupsEditIndex> = {
      payload: {
        group: 'container-in-edit-mode-id',
        index: -1,
        // validate: Triggers.ValidateRow,
      },
      type: FormLayoutActions.updateRepeatingGroupsEditIndex.type,
    };

    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(mockDispatchedAction);
  });

  it('should NOT trigger validate when saving if validation trigger is NOT present', async () => {
    const mockContainerInEditMode = {
      ...mockContainer,
      id: 'container-in-edit-mode-id',
    };
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const store = await render({ container: mockContainerInEditMode });
    const user = userEvent.setup();

    const editButton = screen.getAllByRole('button', {
      name: /Lagre og lukk/i,
    })[1];
    await act(() => user.click(editButton));

    const mockDispatchedAction: PayloadAction<IUpdateRepeatingGroupsEditIndex> = {
      payload: {
        group: 'container-in-edit-mode-id',
        index: -1,
      },
      type: FormLayoutActions.updateRepeatingGroupsEditIndex.type,
    };

    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(mockDispatchedAction);
  });

  it('should display "Add new" button when edit.addButton is undefined', async () => {
    await render();

    const addButton = screen.getByText('Legg til ny');
    expect(addButton).toBeInTheDocument();
  });

  it('should not display "Add new" button when edit.addButton is false', async () => {
    const mockContainerDisabledAddButton = {
      ...mockContainer,
      edit: {
        addButton: false,
      },
    };
    await render({ container: mockContainerDisabledAddButton });

    const addButton = screen.queryByText('Legg til ny');
    expect(addButton).not.toBeInTheDocument();
  });

  it('should display "Add new" button when edit.addButton is true', async () => {
    const mockContainerDisabledAddButton = {
      ...mockContainer,
      edit: {
        addButton: true,
      },
    };
    await render({ container: mockContainerDisabledAddButton });

    const addButton = screen.getByText('Legg til ny');
    expect(addButton).toBeInTheDocument();
  });

  it('should display textResourceBindings.edit_button_open as edit button if present when opening', async () => {
    const mockContainerWithEditButtonOpen = {
      ...mockContainer,
      textResourceBindings: {
        edit_button_open: 'button.open',
      },
    };
    await render({ container: mockContainerWithEditButtonOpen });

    const openButtons = screen.getAllByText('New open text');
    expect(openButtons).toHaveLength(4);
  });

  it('should display textResourceBindings.edit_button_close as edit button if present when closing', async () => {
    const mockContainerWithEditButtonClose = {
      ...mockContainer,
      id: 'container-in-edit-mode-id',
      textResourceBindings: {
        edit_button_close: 'button.close',
      },
    };
    await render({ container: mockContainerWithEditButtonClose });

    const closeButtons = screen.getAllByText('New close text');
    expect(closeButtons).toHaveLength(1);
  });

  it('should display textResourceBindings.save_button as save button if present', async () => {
    const mockContainerWithAddButton = {
      ...mockContainer,
      id: 'container-in-edit-mode-id',
      textResourceBindings: {
        save_button: 'button.save',
      },
    };
    await render({ container: mockContainerWithAddButton });

    const saveButton = screen.getByText('New save text');
    expect(saveButton).toBeInTheDocument();
  });
});
