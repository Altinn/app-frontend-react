import React from 'react';
import { useParams } from 'react-router-dom';

import { Link } from '@digdir/designsystemet-react';
import { DownloadIcon } from '@navikt/aksel-icons';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { z, ZodError } from 'zod';

import { AppTable } from 'src/app-components/Table/Table';
import { Caption } from 'src/components/form/caption/Caption';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { problemDetailsSchema } from 'src/layout/SigneeList/SigneeListComponent';
import classes from 'src/layout/SigneeList/SigneeListComponent.module.css';
import { getSizeWithUnit } from 'src/utils/attachmentsUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath } from 'src/utils/urls/appUrlHelper';
import { makeUrlRelativeIfSameDomain } from 'src/utils/urls/urlHelper';
import type { PropsFromGenericComponent } from 'src/layout';

const signingDocumentSchema = z
  .object({
    id: z.string(),
    dataType: z.string(),
    contentType: z.string(),
    filename: z.string().nullish(),
    size: z.number(),
    selfLinks: z.object({
      apps: z.string(),
    }),
  })
  .transform((it) => ({
    ...it,
    filename: it.filename ?? '',
    url: makeUrlRelativeIfSameDomain(it.selfLinks.apps),
  }));

type SigningDocument = z.infer<typeof signingDocumentSchema>;

async function fetchDocumentList(partyId: string, instanceGuid: string): Promise<SigningDocument[]> {
  const url = `${appPath}/instances/${partyId}/${instanceGuid}/signing/data-elements`;

  const response = await httpGet(url);

  return z
    .object({ dataElements: z.array(signingDocumentSchema) })
    .parse(response)
    .dataElements.toSorted((a, b) => (a.filename ?? '').localeCompare(b.filename ?? ''));
}

export function SigningDocumentListComponent({ node }: PropsFromGenericComponent<'SigningDocumentList'>) {
  const { partyId, instanceGuid } = useParams();
  const { textResourceBindings } = useNodeItem(node);
  const isDataModelDataElement = useIsDataModelDataElement();
  const { langAsString } = useLanguage();

  const { data, error } = useQuery({
    queryKey: ['signingDocumentList', partyId, instanceGuid],
    queryFn: () => fetchDocumentList(partyId!, instanceGuid!),
    staleTime: 1000 * 60 * 30, // 30 minutes
    select: (data) => data.filter((it) => !isDataModelDataElement(it.dataType)),
  });

  if (error) {
    return <SigningDocumentListError error={error} />;
  }

  return (
    <AppTable
      size='md'
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
          accessors: ['tags'],
        },
        {
          header: langAsString('signing_document_list.header_size'),
          accessors: [],
          renderCell: (_, rowData) => getSizeWithUnit(rowData.size),
        },
        {
          header: '',
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

function SigningDocumentListError({ error }: { error: Error }) {
  const { langAsString } = useLanguage();

  if (error instanceof ZodError) {
    //   // TODO: alarm? telemetri?
    window.logErrorOnce(
      `Did not get the expected response from the server. The response didn't match the expected schema: \n${error}`,
    );

    return (
      <div>
        <Lang id='signing_document_list.parse_error' />
        <br />
        <Lang
          id='general.customer_service_error_message'
          params={[
            'general.customer_service_phone_number',
            'general.customer_service_email',
            'general.customer_service_slack',
          ].map((it, idx) => (
            <Lang
              key={idx}
              id={it?.toString()}
            />
          ))}
        />
      </div>
    );
  }

  if (isAxiosError(error)) {
    const parsed = problemDetailsSchema.safeParse(error.response?.data);

    if (parsed.success) {
      window.logErrorOnce(langAsString(error.message));
      window.logErrorOnce(parsed);
      return <Lang id='signing_document_list.api_error_display' />;
    }
  }

  return <Lang id='signing_document_list.unknown_api_error' />;
}

function useIsDataModelDataElement() {
  const { dataTypes } = useApplicationMetadata();

  const dataModelsFromMetadata = dataTypes.filter((it) => it.appLogic?.classRef);

  return (dataElementId: string) => dataModelsFromMetadata.some((it) => it.id === dataElementId);
}
