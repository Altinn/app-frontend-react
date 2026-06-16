import React from 'react';
import { useParams } from 'react-router-dom';

import { Heading, Link } from '@digdir/designsystemet-react';
import { DownloadIcon } from '@navikt/aksel-icons';

import { AppTable } from 'src/app-components/Table/Table';
import captionClasses from 'src/components/form/caption/Caption.module.css';
import { Description } from 'src/components/form/Description';
import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { getFileEnding, removeFileEnding } from 'src/layout/FileUpload/utils/fileEndings';
import classes from 'src/layout/SigneeList/SigneeListComponent.module.css';
import { useDocumentList } from 'src/layout/SigningDocumentList/api';
import { SigningDocumentListError } from 'src/layout/SigningDocumentList/SigningDocumentListError';
import utilClasses from 'src/styles/utils.module.css';
import { getSizeWithUnit } from 'src/utils/attachmentsUtils';
import type { ITextResourceBindings } from 'src/layout/layout';

const tableLabelId = 'signing-document-list';

export function SigningDocumentListComponent({
  textResourceBindings,
}: {
  textResourceBindings: ITextResourceBindings<'SigningDocumentList'>;
}) {
  const { instanceOwnerPartyId, instanceGuid } = useParams();
  const { langAsString } = useLanguage();
  const { altinnNugetVersion } = useApplicationMetadata();

  const { data, isLoading, error } = useDocumentList(instanceOwnerPartyId, instanceGuid, altinnNugetVersion);

  if (error) {
    return <SigningDocumentListError error={error} />;
  }

  const downloadLabel = langAsString('signing_document_list.download');

  return (
    <>
      {textResourceBindings?.title && (
        <div className={captionClasses.tableCaption}>
          <Heading
            level={2}
            data-size='lg'
          >
            <Lang id={textResourceBindings.title} />
          </Heading>
          {textResourceBindings.description && (
            <Description
              className={captionClasses.description}
              componentId={tableLabelId}
              description={<Lang id={textResourceBindings.description} />}
            />
          )}
          {textResourceBindings.help && (
            <HelpTextContainer
              id={tableLabelId}
              helpText={<Lang id={textResourceBindings.help} />}
            />
          )}
        </div>
      )}
      <AppTable
        size='md'
        isLoading={isLoading}
        headerClassName={classes.header}
        tableClassName={classes.table}
        tableTestId='signing-document-list'
        ariaLabel={textResourceBindings?.title ? langAsString(textResourceBindings.title) : undefined}
        data={data ?? []}
        emptyText={<Lang id='general.empty_table' />}
        columns={[
          {
            header: langAsString('signing_document_list.header_filename'),
            accessors: [],
            renderCell: (_, rowData) => (
              <Link
                href={rowData.url}
                rel='noopener noreferrer'
                title={rowData.filename}
              >
                <span className={classes.nameWrapper}>
                  <span className={classes.truncate}>{removeFileEnding(rowData.filename)}</span>
                  <span className={classes.extension}>{getFileEnding(rowData.filename)}</span>
                </span>
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
            header: <span className={utilClasses.visuallyHidden}>{downloadLabel}</span>,
            accessors: [],
            renderCell: (_, rowData) => (
              <Link
                href={rowData.url}
                style={{ display: 'flex', gap: '0.5rem', whiteSpace: 'nowrap', textDecoration: 'none' }}
                download
              >
                {downloadLabel}
                <DownloadIcon fontSize='1.5rem' />
              </Link>
            ),
          },
        ]}
      />
    </>
  );
}
