import React from 'react';
import { useParams } from 'react-router-dom';

import { Link } from '@digdir/designsystemet-react';
import { DownloadIcon } from '@navikt/aksel-icons';
import { useQuery } from '@tanstack/react-query';

import { AppTable } from 'src/app-components/Table/Table';
import { Caption } from 'src/components/form/caption/Caption';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/layout/SigneeList/SigneeListComponent.module.css';
import { fetchDocumentList } from 'src/layout/SigningDocumentList/api';
import { SigningDocumentListError } from 'src/layout/SigningDocumentList/SigningDocumentListError';
import { getSizeWithUnit } from 'src/utils/attachmentsUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface SigningDocumentListSummaryProps {
  componentNode: LayoutNode<'SigningDocumentList'>;
}

export function SigningDocumentListSummary({ componentNode }: SigningDocumentListSummaryProps) {
  const summaryTitle = useNodeItem(componentNode, (i) => i.textResourceBindings?.summary_title);

  const { partyId, instanceGuid } = useParams();
  const { langAsString } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: ['signingDocumentList', partyId, instanceGuid],
    queryFn: () => fetchDocumentList(partyId!, instanceGuid!),
    staleTime: Infinity,
  });

  if (error) {
    return <SigningDocumentListError error={error} />;
  }

  return (
    <AppTable
      size='md'
      isLoading={isLoading}
      headerClassName={classes.header}
      tableClassName={classes.table}
      data={data ?? []}
      caption={
        <Caption
          title={summaryTitle ?? langAsString('signing_document_list_summary.header')}
          designSystemLabelProps={{ className: classes.caption }}
        />
      }
      columns={[
        {
          header: langAsString('signing_document_list.header_filename'),
          accessors: [],
          renderCell: (_, rowData) => (
            <Link
              href={rowData.url}
              rel='noopener noreferrer'
            >
              {rowData.filename}
            </Link>
          ),
        },
        {
          header: langAsString('signing_document_list.header_attachment_type'),
          accessors: [],
          renderCell: (_, rowData) => rowData.attachmentTypes.map((it) => langAsString(it)).join(', '),
        },
        {
          header: langAsString('signing_document_list.header_size'),
          accessors: [],
          renderCell: (_, rowData) => getSizeWithUnit(rowData.size),
        },
        {
          header: null,
          accessors: [],
          renderCell: (_, rowData) => (
            <Link
              href={rowData.url}
              style={{ display: 'flex', gap: '0.5rem', whiteSpace: 'nowrap', textDecoration: 'none' }}
              download
            >
              Last ned
              <DownloadIcon fontSize='1.5rem' />
            </Link>
          ),
        },
      ]}
    />
  );
}
