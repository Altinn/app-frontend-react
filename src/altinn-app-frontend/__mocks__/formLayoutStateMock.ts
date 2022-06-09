import { ILayoutState } from '../src/features/form/layout/formLayoutSlice';

export function getFormLayoutStateMock(customStates?: Partial<ILayoutState>): ILayoutState {
  const mockFormLayoutState: ILayoutState = {
    layouts: {
      FormLayout: [
        {
          id: 'field1',
          type: 'Input',
          dataModelBindings: {
            simpleBinding: 'Group.prop1',
          },
          textResourceBindings: {
            title: 'Title',
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
            title: 'Title',
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
            title: 'Title',
          },
          readOnly: false,
          required: false,
          disabled: false,
        },
      ],
    },
    error: null,
    uiConfig: {
      autoSave: true,
      focus: null,
      hiddenFields: [],
      repeatingGroups: {
        group: {
          index: 1,
          dataModelBinding: 'someGroup',
        }
      },
      fileUploadersWithTag: null,
      currentView: 'FormLayout',
      navigationConfig: {},
      layoutOrder: ['FormLayout'],
    },
    layoutsets: null,
  };

  return {
    ...mockFormLayoutState,
    ...customStates,
  };
}
