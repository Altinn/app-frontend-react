import React from 'react';

import { screen } from '@testing-library/react';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { getInstanceDataMock } from 'src/__mocks__/instanceDataStateMock';
import { AttachmentSummaryComponent } from 'src/layout/FileUpload/Summary/AttachmentSummaryComponent';
import { renderWithNode } from 'src/test/renderWithProviders';
import type { CompFileUploadWithTagExternal } from 'src/layout/FileUploadWithTag/config.generated';
import type { RootState } from 'src/redux/store';
import type { IRuntimeState } from 'src/types';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const availableOptions = {
  'https://local.altinn.cloud/ttd/test/api/options/a?language=nb&b=undefined': [
    { value: 'a', label: 'aa option value' },
    { value: 'b', label: 'ab option value' },
    { value: 'c', label: 'ac option value' },
  ],
  'https://local.altinn.cloud/ttd/test/api/options/b?language=nb': [
    { value: 'a', label: 'ba option value' },
    { value: 'b', label: 'bb option value' },
    { value: 'c', label: 'bc option value' },
  ],
  'https://local.altinn.cloud/ttd/test/api/options/c?language=nb': [
    { value: 'a', label: 'ca option value' },
    { value: 'b', label: 'cb option value' },
    { value: 'c', label: 'cc option value' },
  ],
  'https://local.altinn.cloud/ttd/test/api/options/d?language=nb&b=undefined': [
    { value: 'a', label: 'da option value' },
    { value: 'b', label: 'db option value' },
    { value: 'c', label: 'dc option value' },
  ],
};

describe('AttachmentWithTagSummaryComponent', () => {
  const attachmentName = 'attachment-name-1';
  const formLayoutItem: CompFileUploadWithTagExternal = {
    id: 'myComponent',
    type: 'FileUploadWithTag',
    textResourceBindings: {},
    optionsId: 'a',
    mapping: { a: 'b' },
    maxFileSizeInMB: 15,
    displayMode: 'list',
    maxNumberOfAttachments: 12,
    minNumberOfAttachments: 0,
  };
  const initialState = getInitialStateMock();
  const mockState = (formLayoutItem: CompFileUploadWithTagExternal): Pick<RootState, 'formLayout'> => ({
    formLayout: {
      layouts: {
        FormLayout: [formLayoutItem],
      },
      layoutSetId: null,
      uiConfig: initialState.formLayout.uiConfig,
      layoutsets: initialState.formLayout.layoutsets,
      error: null,
    },
  });
  const extendedState: Partial<RootState> = {
    textResources: {
      language: 'nb',
      error: null,
      resourceMap: {
        a: {
          value: 'the a',
        },
        b: {
          value: 'the b',
        },
        c: {
          value: 'the c',
        },
        'ba option value': {
          value: 'the result',
        },
      },
    },
  };
  test('should render file upload with tag without content with the text Du har ikke lagt inn informasjon her', async () => {
    await render(formLayoutItem);
    const element = screen.getByTestId('attachment-with-tag-summary');
    expect(element).toHaveTextContent('Du har ikke lagt inn informasjon her');
  });
  test('should contain attachments', async () => {
    await render(formLayoutItem, extendedState);
    expect(await screen.findByText(attachmentName)).toBeInTheDocument();
  });
  test('should render mapped option label', async () => {
    await render({ ...formLayoutItem, optionsId: 'd' }, extendedState);
    expect(await screen.findByText('da option value')).toBeInTheDocument();
  });
  test('should render the text resource', async () => {
    await render({ ...formLayoutItem, optionsId: 'b', mapping: undefined }, extendedState);
    expect(await screen.findByText('the result')).toBeInTheDocument();
  });
  test('should not render a text resource', async () => {
    await render({ ...formLayoutItem, optionsId: 'c', mapping: undefined }, extendedState);
    expect(await screen.findByText('ca option value')).toBeInTheDocument();
  });

  const render = async (component: CompFileUploadWithTagExternal, extendState?: Partial<RootState>) => {
    const preloadedState: IRuntimeState = {
      ...initialState,
      ...mockState(component),
      ...extendState,
    };

    await renderWithNode<LayoutNode<'FileUploadWithTag'>>({
      nodeId: 'myComponent',
      renderer: ({ node }) => <AttachmentSummaryComponent targetNode={node} />,
      preloadedState,
      mockedQueries: {
        fetchOptions: (url) =>
          availableOptions[url]
            ? Promise.resolve(availableOptions[url])
            : Promise.reject(new Error(`No options available for ${url}`)),
        fetchInstanceData: () => {
          const mock = getInstanceDataMock();
          const attachment: IData = {
            id: '123ab-456cd-789ef-012gh',
            dataType: 'myComponent',
            filename: attachmentName,
            size: 1200,
            tags: ['a', 'b', 'c'],
            instanceGuid: mock.id,
            refs: [],
            blobStoragePath: '',
            locked: false,
            contentType: 'application/pdf',
            lastChangedBy: 'test',
            lastChanged: '2021-09-08T12:00:00',
            createdBy: 'test',
            created: '2021-09-08T12:00:00',
          };

          return Promise.resolve({
            ...mock,
            data: [...mock.data, attachment],
          });
        },
      },
    });
  };
});
