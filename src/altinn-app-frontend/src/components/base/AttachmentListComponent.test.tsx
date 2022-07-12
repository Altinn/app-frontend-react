import React from 'react';
import { screen } from '@testing-library/react';

import {
  getInitialStateMock,
  getInstanceDataStateMock,
  applicationMetadataMock,
} from '../../../__mocks__/mocks';
import type { IInstanceDataState } from '../../shared/resources/instanceData/instanceDataReducers';
import type { IData } from '../../../../shared/src';
import type { IAttachmentListProps } from './AttachmentListComponent';

import { renderWithProviders } from 'src/../testUtils';

import { AttachmentListComponent } from './AttachmentListComponent';

describe('FileUploadComponent', () => {
  it('should render default AttachmentList component', () => {
    render({ text: 'Attachments' });
    expect(screen.getByText('Attachments')).toBeInTheDocument();
  });
});

function render(props: Partial<IAttachmentListProps> = {}) {
  const mockId = 'mockId';

  const mockApplicationMetadata = applicationMetadataMock;
  const instanceDataMock: IInstanceDataState = getInstanceDataStateMock();
  const dataElement: IData = {
    id: 'test-data-element-1',
    instanceGuid: instanceDataMock.instance.id,
    dataType: 'test-data-type-1',
    filename: 'testData1.pdf',
    contentType: 'application/pdf',
    blobStoragePath: '',
    selfLinks: {
      apps: null,
      platform: null,
    },
    size: 1234,
    locked: false,
    refs: [],
    created: new Date('2021-01-01'),
    createdBy: 'testUser',
    lastChanged: new Date('2021-01-01'),
    lastChangedBy: 'testUser',
  };
  const mockInstanceData = {
    ...instanceDataMock,
  };

  mockInstanceData.instance.data = [dataElement];

  const mockInitialState = getInitialStateMock({
    applicationMetadata: {
      applicationMetadata: mockApplicationMetadata,
      error: null,
    },
    instanceData: mockInstanceData,
  });

  const defaultProps = {
    id: mockId,
    text: 'Attachments',
    dataTypeIds: ['test-data-type-1'],
  } as IAttachmentListProps;

  return renderWithProviders(
    <AttachmentListComponent
      {...defaultProps}
      {...props}
    />,
    {
      preloadedState: mockInitialState,
    },
  );
}
