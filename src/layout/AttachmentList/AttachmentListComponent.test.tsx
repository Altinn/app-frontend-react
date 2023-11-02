import React from 'react';

import { screen } from '@testing-library/react';

import { getInstanceDataMock } from 'src/__mocks__/instanceDataStateMock';
import { AttachmentListComponent } from 'src/layout/AttachmentList/AttachmentListComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { IData } from 'src/types/shared';

describe('AttachmentListComponent', () => {
  it('should render default AttachmentList component', async () => {
    await render();
    expect(screen.getByText('Attachments')).toBeInTheDocument();
  });
});

const render = () =>
  renderGenericComponentTest({
    type: 'AttachmentList',
    renderer: (props) => <AttachmentListComponent {...props} />,
    component: {
      dataTypeIds: ['test-data-type-1'],
      textResourceBindings: {
        title: 'Attachments',
      },
    },
    mockedQueries: {
      fetchInstanceData: () => {
        const mock = getInstanceDataMock();
        const dataElement: IData = {
          id: 'test-data-element-1',
          instanceGuid: mock.id,
          dataType: 'test-data-type-1',
          filename: 'testData1.pdf',
          contentType: 'application/pdf',
          blobStoragePath: '',
          size: 1234,
          locked: false,
          refs: [],
          created: new Date('2021-01-01').toISOString(),
          createdBy: 'testUser',
          lastChanged: new Date('2021-01-01').toISOString(),
          lastChangedBy: 'testUser',
        };
        mock.data = [dataElement];

        return Promise.resolve(mock);
      },
    },
  });
