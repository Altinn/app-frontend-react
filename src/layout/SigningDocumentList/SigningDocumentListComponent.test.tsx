import React from 'react';

import { jest } from '@jest/globals';
import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { randomUUID } from 'crypto';
import type { UseQueryResult } from '@tanstack/react-query';

import { SigningDocumentListComponent } from 'src/layout/SigningDocumentList/SigningDocumentListComponent';
import { ProcessTaskType } from 'src/types';
import type { fetchDocumentList } from 'src/layout/SigningDocumentList/api';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeItemFromNode } from 'src/utils/layout/types';

const mockDocumentList: Awaited<ReturnType<typeof fetchDocumentList>> = [
  {
    attachmentTypes: ['attachmentType1'],
    filename: 'filename1',
    dataType: 'dataType1',
    size: 1000000,
    url: 'url1',
  },
  {
    attachmentTypes: ['attachmentType2'],
    filename: 'filename2',
    dataType: 'dataType2',
    size: 2000000,
    url: 'url2',
  },
];

jest.mock('src/utils/layout/useNodeItem', () => ({
  useNodeItem: jest.fn(() => ({
    textResourceBindings: {
      title: 'Signing Document List',
      description: 'description',
      help: 'help',
    },
  })),
}));

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(() => ({
    partyId: 'partyId',
    instanceGuid: randomUUID(),
  })),
}));

jest.mock('src/features/language/useLanguage', () => ({
  useLanguage: jest.fn(() => ({
    langAsString: (inputString: string) => inputString,
  })),
}));

jest.mock('src/features/language/Lang', () => ({
  Lang: ({ id }: { id: string }) => id,
}));

jest.mock('src/features/applicationMetadata/ApplicationMetadataProvider', () => ({
  useApplicationMetadata: jest.fn(() => ({
    dataTypes: [],
  })),
}));

jest.mock('src/features/instance/ProcessContext', () => ({
  useTaskTypeFromBackend: jest.fn(() => ProcessTaskType.Signing),
}));

jest.mock('src/layout/SigningDocumentList/api');

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');

  return {
    useQuery: jest.fn(() => ({
      ...actual.useQuery,
      data: mockDocumentList,
      isLoading: false,
      error: undefined,
    })),
  };
});

jest.mock('src/layout/SigningDocumentList/SigningDocumentListError', () => ({
  SigningDocumentListError: jest.fn(({ error }: { error: Error }) => error.message),
}));

const mockedUseQuery = jest.mocked(useQuery);

describe('SigningDocumentList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(
      <SigningDocumentListComponent
        textResourceBindings={{} as NodeItemFromNode<LayoutNode<'SigningDocumentList'>>['textResourceBindings']}
      />,
    );

    screen.getByRole('table', { name: /Signing Document List/ });
    screen.getByRole('columnheader', { name: 'signing_document_list.header_filename' });
    screen.getByRole('columnheader', { name: 'signing_document_list.header_attachment_type' });
    screen.getByRole('columnheader', { name: 'signing_document_list.header_size' });

    expect(screen.getAllByRole('columnheader')).toHaveLength(4);

    expect(screen.getAllByRole('row')).toHaveLength(3);

    screen.getByRole('row', { name: /filename1 attachmentType1 977 KB Last ned/i });
    screen.getByRole('row', { name: /filename2 attachmenttype2 2 mb last ned/i });
  });

  it('should render error message when API call fails', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('API error'),
    } as UseQueryResult);

    render(
      <SigningDocumentListComponent
        textResourceBindings={{} as NodeItemFromNode<LayoutNode<'SigningDocumentList'>>['textResourceBindings']}
      />,
    );

    screen.getByText('API error');
  });

  it('should render spinner when loading', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as UseQueryResult);

    render(
      <SigningDocumentListComponent
        textResourceBindings={{} as NodeItemFromNode<LayoutNode<'SigningDocumentList'>>['textResourceBindings']}
      />,
    );

    screen.getByRole('table', { name: /Signing Document List/ });
    screen.getByRole('columnheader', { name: 'signing_document_list.header_filename' });
    screen.getByRole('columnheader', { name: 'signing_document_list.header_attachment_type' });
    screen.getByRole('columnheader', { name: 'signing_document_list.header_size' });
    screen.getByRole('cell', { name: /loading data.../i });

    expect(screen.getAllByRole('row')).toHaveLength(2);
  });
});
