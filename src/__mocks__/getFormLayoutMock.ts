import { defaultDataTypeMock } from 'src/__mocks__/getLayoutSetsMock';
import type { ILayout } from 'src/layout/layout';

export function getFormLayoutMock(): ILayout {
  return [
    {
      id: 'field1',
      type: 'Input',
      dataModelBindings: {
        simpleBinding: { dataType: defaultDataTypeMock, field: 'Group.prop1' },
      },
      textResourceBindings: {
        title: 'Title',
      },
      readOnly: false,
      required: false,
    },
    {
      id: 'field2',
      type: 'Input',
      dataModelBindings: {
        simpleBinding: { dataType: defaultDataTypeMock, field: 'Group.prop2' },
      },
      textResourceBindings: {
        title: 'Title',
      },
      readOnly: false,
      required: false,
    },
    {
      id: 'field3',
      type: 'Input',
      dataModelBindings: {
        simpleBinding: { dataType: defaultDataTypeMock, field: 'Group.prop3' },
      },
      textResourceBindings: {
        title: 'Title',
      },
      readOnly: false,
      required: false,
    },
  ];
}
