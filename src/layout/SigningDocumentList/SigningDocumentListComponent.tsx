import React from 'react';
import { useParams } from 'react-router-dom';

import { Link } from '@digdir/designsystemet-react';
import { DownloadIcon } from '@navikt/aksel-icons';
import { useQuery } from '@tanstack/react-query';

import { AppTable } from 'src/app-components/Table/Table';
import { Caption } from 'src/components/form/caption/Caption';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/layout/SigneeList/SigneeListComponent.module.css';
import { fetchDocumentList } from 'src/layout/SigningDocumentList/api';
import { SigningDocumentListError } from 'src/layout/SigningDocumentList/SigningDocumentListError';
import { ProcessTaskType } from 'src/types';
import { getSizeWithUnit } from 'src/utils/attachmentsUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export function SigningDocumentListComponent({ node }: PropsFromGenericComponent<'SigningDocumentList'>) {
  const { partyId, instanceGuid } = useParams();
  const { textResourceBindings } = useNodeItem(node);
  const isDataModelDataElement = useIsDataModelDataElement();
  const taskType = useTaskTypeFromBackend();
  const { langAsString } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: ['signingDocumentList', partyId, instanceGuid],
    queryFn: () => fetchDocumentList(partyId!, instanceGuid!),
    staleTime: 1000 * 60 * 30, // 30 minutes
    select: (data) => data.filter((it) => !isDataModelDataElement(it.dataType)),
  });

  if (taskType !== ProcessTaskType.Signing) {
    return (
      <Lang
        id='signing.wrong_task_error'
        params={['SigningDocumentList']}
      />
    );
  }

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
        textResourceBindings?.title ? (
          <Caption
            title={<Lang id={textResourceBindings?.title} />}
            designSystemLabelProps={{ className: classes.caption }}
            description={<Lang id={textResourceBindings?.description} />}
            helpText={textResourceBindings?.help ? { text: textResourceBindings?.help } : undefined}
          />
        ) : undefined
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

function useIsDataModelDataElement() {
  const { dataTypes } = useApplicationMetadata();

  const dataModelsFromMetadata = dataTypes.filter((it) => it.appLogic?.classRef);

  return (dataElementId: string) => dataModelsFromMetadata.some((it) => it.id === dataElementId);
}
