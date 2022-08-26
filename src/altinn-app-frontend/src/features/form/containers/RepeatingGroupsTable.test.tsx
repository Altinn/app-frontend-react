import * as React from 'react';

import { getFormLayoutGroupMock } from '__mocks__/mocks';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockMediaQuery, renderWithProviders } from 'testUtils';

import { RepeatingGroupTable } from 'src/features/form/containers/RepeatingGroupTable';
import { createRepeatingGroupComponents } from 'src/utils/formLayout';
import type { IRepeatingGroupTableProps } from 'src/features/form/containers/RepeatingGroupTable';
import type {
  ILayoutComponent,
  ILayoutGroup,
  ISelectionComponentProps,
} from 'src/features/form/layout';
import type { ILayoutState } from 'src/features/form/layout/formLayoutSlice';
import type { IAttachments } from 'src/shared/resources/attachments';
import type { IOption, ITextResource } from 'src/types';

import type { ILanguage } from 'altinn-shared/types';

const user = userEvent.setup();

let mockContainer: ILayoutGroup;
let mockLanguage: ILanguage;
let mockTextResources: ITextResource[];
let mockAttachments: IAttachments;
let mockComponents: ILayoutComponent[];
let mockTestLayout: ILayoutState;
let mockTestCurrentView: string;
let mockData: any;
let mockOptions: IOption[];
let repeatingGroupIndex: number;
let mockRepeatingGroupDeepCopyComponents: Array<
  Array<ILayoutComponent | ILayoutGroup>
>;

describe('RepeatingGroupTable', () => {
  beforeEach(() => {
    mockOptions = [{ value: 'option.value', label: 'option.label' }];
    mockComponents = [
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
        disabled: false,
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
        disabled: false,
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
        disabled: false,
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
        disabled: false,
        options: mockOptions,
      } as ISelectionComponentProps,
    ];

    mockContainer = getFormLayoutGroupMock({});

    mockLanguage = {
      general: {
        delete: 'Delete',
        edit_alt: 'Edit',
      },
    };

    mockTestLayout = {
      layouts: {
        FormLayout: [].concat(mockContainer).concat(mockComponents),
      },
      uiConfig: {
        hiddenFields: [],
        repeatingGroups: {
          'mock-container-id': {
            index: 3,
          },
        },
        autoSave: false,
        currentView: 'FormLayout',
        focus: undefined,
        layoutOrder: ['FormLayout'],
      },
      error: null,
      layoutsets: null,
    };

    mockData = {
      formData: {
        'some-group[1].checkboxBinding': 'option.value',
      },
    };

    mockTextResources = [
      { id: 'option.label', value: 'Value to be shown' },
      { id: 'edit_button_open', value: 'Edit' },
      { id: 'edit_button_close', value: 'Edit' },
    ];

    mockTestCurrentView = 'FormLayout';
    repeatingGroupIndex = 3;
    mockRepeatingGroupDeepCopyComponents = createRepeatingGroupComponents(
      mockContainer,
      mockComponents,
      repeatingGroupIndex,
      mockTextResources,
    );
  });

  describe('desktop view', () => {
    const { setScreenWidth } = mockMediaQuery(992);
    beforeEach(() => {
      setScreenWidth(1337);
    });

    it('should match snapshot', () => {
      const { asFragment } = render();
      expect(asFragment()).toMatchSnapshot();
    });

    it('should trigger onClickRemove on delete-button click', async () => {
      const onClickRemove = jest.fn();
      render({ onClickRemove: onClickRemove });

      await user.click(screen.getAllByRole('button', { name: /delete/i })[0]);

      expect(onClickRemove).toBeCalledTimes(1);
    });

    it('should trigger setEditIndex on edit-button click', async () => {
      const setEditIndex = jest.fn();
      render({ setEditIndex: setEditIndex });

      await user.click(screen.getAllByRole('button', { name: /edit/i })[0]);

      expect(setEditIndex).toBeCalledTimes(1);
    });
  });

  describe('tablet view', () => {
    const { setScreenWidth } = mockMediaQuery(992);
    beforeEach(() => {
      setScreenWidth(992);
    });

    it('should render as mobile-version for small screens', () => {
      render();

      const altinnMobileTable = screen.queryByTestId(/altinn-mobile-table/i);

      expect(altinnMobileTable).toBeInTheDocument();
    });
  });

  describe('mobile view', () => {
    const { setScreenWidth } = mockMediaQuery(768);
    beforeEach(() => {
      setScreenWidth(768);
    });

    it('should render edit and delete buttons as icons for screens smaller thnn 786px', () => {
      render();

      const iconButtonsDelete = screen.getAllByTestId(/delete-button/i);
      const iconButtonsEdit = screen.getAllByTestId(/edit-button/i);

      expect(iconButtonsDelete).toHaveLength(4);
      expect(iconButtonsDelete[0]).toContainHTML(
        `<span class="MuiIconButton-label"><i class="ai ai-trash" /></span>`,
      );
      expect(iconButtonsEdit).toHaveLength(4);
      expect(iconButtonsEdit[0]).toContainHTML(
        `<span class="MuiIconButton-label"><i class="fa fa-edit makeStyles-editIcon-60" /></span>`,
      );
    });
  });
});

const render = (props: Partial<IRepeatingGroupTableProps> = {}) => {
  const allProps = {
    container: mockContainer,
    attachments: mockAttachments,
    language: mockLanguage,
    textResources: mockTextResources,
    components: mockComponents,
    currentView: mockTestCurrentView,
    editIndex: -1,
    formData: mockData,
    hiddenFields: [],
    id: mockContainer.id,
    layout: mockTestLayout.layouts[mockTestCurrentView],
    options: {},
    repeatingGroupDeepCopyComponents: mockRepeatingGroupDeepCopyComponents,
    repeatingGroupIndex: repeatingGroupIndex,
    repeatingGroups: mockTestLayout.uiConfig.repeatingGroups,
    deleting: false,
    onClickRemove: jest.fn(),
    setEditIndex: jest.fn(),
    validations: {},
    ...props,
  } as IRepeatingGroupTableProps;

  return renderWithProviders(<RepeatingGroupTable {...allProps} />);
};
