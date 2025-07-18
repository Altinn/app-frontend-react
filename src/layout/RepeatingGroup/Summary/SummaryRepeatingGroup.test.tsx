import React from 'react';

import { jest } from '@jest/globals';

import { defaultDataTypeMock } from 'src/__mocks__/getLayoutSetsMock';
import { ALTINN_ROW_ID } from 'src/features/formData/types';
import { SummaryRepeatingGroup } from 'src/layout/RepeatingGroup/Summary/SummaryRepeatingGroup';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';

describe('SummaryRepeatingGroup', () => {
  let mockHandleDataChange: () => void;

  beforeEach(() => {
    mockHandleDataChange = jest.fn();
  });

  test('SummaryRepeatingGroup -- should match snapshot', async () => {
    const { asFragment } = await render();
    expect(asFragment()).toMatchSnapshot();
  });

  async function render() {
    return await renderWithInstanceAndLayout({
      renderer: (
        <SummaryRepeatingGroup
          changeText='Change'
          onChangeClick={mockHandleDataChange}
          targetBaseComponentId='groupComponent'
        />
      ),
      queries: {
        fetchFormData: async () => ({
          mockGroup: [
            {
              [ALTINN_ROW_ID]: 'abc123',
              mockDataBinding1: '1',
              mockDataBinding2: '2',
            },
          ],
        }),
        fetchLayouts: async () => ({
          FormLayout: {
            data: {
              layout: [
                {
                  type: 'RepeatingGroup',
                  id: 'groupComponent',
                  dataModelBindings: {
                    group: { dataType: defaultDataTypeMock, field: 'mockGroup' },
                  },
                  textResourceBindings: {
                    title: 'mockGroupTitle',
                  },
                  children: ['0:mockId1', '1:mockId2'],
                  edit: {
                    multiPage: true,
                  },
                  maxCount: 3,
                },
                {
                  type: 'Input',
                  id: 'mockId1',
                  dataModelBindings: {
                    simpleBinding: { dataType: defaultDataTypeMock, field: 'mockGroup.mockDataBinding1' },
                  },
                  readOnly: false,
                  required: false,
                  textResourceBindings: {
                    title: 'mockField1',
                  },
                  triggers: [],
                },
                {
                  type: 'Input',
                  id: 'mockId2',
                  dataModelBindings: {
                    simpleBinding: { dataType: defaultDataTypeMock, field: 'mockGroup.mockDataBinding2' },
                  },
                  readOnly: false,
                  required: false,
                  textResourceBindings: {
                    title: 'mockField2',
                  },
                  triggers: [],
                },
                {
                  type: 'Summary',
                  id: 'mySummary',
                  componentRef: 'groupComponent',
                  largeGroup: false,
                },
              ],
            },
          },
        }),
        fetchTextResources: () =>
          Promise.resolve({
            language: 'nb',
            resources: [
              { id: 'mockGroupTitle', value: 'Mock group' },
              { id: 'mockField1', value: 'Mock field 1' },
              { id: 'mockField2', value: 'Mock field 2' },
            ],
          }),
      },
    });
  }
});
