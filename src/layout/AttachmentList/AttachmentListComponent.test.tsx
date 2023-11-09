import React from 'react';

import { screen } from '@testing-library/react';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { AttachmentListComponent } from 'src/layout/AttachmentList/AttachmentListComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';

describe('AttachmentListComponent', () => {
  it('should render default AttachmentList component', async () => {
    await render();
    expect(screen.getByText('Attachments')).toBeInTheDocument();
  });
});

const render = async () =>
  await renderGenericComponentTest({
    type: 'AttachmentList',
    renderer: (props) => <AttachmentListComponent {...props} />,
    component: {
      dataTypeIds: ['test-data-type-1'],
      textResourceBindings: {
        title: 'Attachments',
      },
    },
    reduxState: getInitialStateMock((state) => {
      state.deprecated.lastKnownInstance!.data.push({
        id: 'test-data-element-1',
        instanceGuid: state.deprecated.lastKnownInstance!.id,
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
      });
    }),
  });
