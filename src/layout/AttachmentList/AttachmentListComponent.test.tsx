import React from 'react';

import { screen } from '@testing-library/react';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { AttachmentListComponent } from 'src/layout/AttachmentList/AttachmentListComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';

describe('AttachmentListComponent', () => {
  beforeEach(() => {
    jest.spyOn(window, 'logErrorOnce').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render default AttachmentList component', async () => {
    await render();
    expect(screen.getByText('Attachments')).toBeInTheDocument();
    expect(screen.getByText('testData1.pdf')).toBeInTheDocument();

    // We know this happens, because we don't have any uploader components available for this data type
    expect(window.logErrorOnce).toHaveBeenCalledWith(
      'Could not find matching component/node for attachment test-data-type-1/test-data-element-1 ' +
        '(there may be a problem with the mapping of attachments to form data in a repeating group). ' +
        'Traversed 0 nodes with id test-data-type-1',
    );
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
