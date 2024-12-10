import React from 'react';
import { useParams } from 'react-router-dom';

import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { AppTable } from 'src/app-components/Table/Table';
import { Caption } from 'src/components/form/caption/Caption';
import { useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/layout/SigneeList/SigneeListComponent.module.css';
import { SigneeStateTag } from 'src/layout/SigneeList/SigneeStateTag';
import { ProcessTaskType } from 'src/types';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath } from 'src/utils/urls/appUrlHelper';
import type { LangProps } from 'src/features/language/Lang';
import type { PropsFromGenericComponent } from 'src/layout';

/*
TODO:
- Unit tests?
- Cypress tests
- Right align the status column
*/

const signeeStateSchema = z
  .object({
    name: z.string().nullish(),
    organisation: z.string().nullish(),
    hasSigned: z.boolean(),
    delegationSuccessful: z.boolean(),
    notificationSuccessful: z.boolean(),
  })
  .refine(({ name, organisation }) => name || organisation);

export type SigneeState = z.infer<typeof signeeStateSchema>;

type SigneeListResponse = { errors: null; data: SigneeState[] } | { errors: LangProps[]; data: null };

const problemDetailsSchema = z.object({
  detail: z.string(),
  status: z.number(),
  title: z.string(),
});

async function fetchSigneeList(partyId: string, instanceGuid: string): Promise<SigneeListResponse> {
  const url = `${appPath}/instances/${partyId}/${instanceGuid}/signing`;

  try {
    const response = await httpGet(url);
    const parsed = z.object({ signeeStates: z.array(signeeStateSchema) }).safeParse(response);

    if (!parsed.success) {
      // TODO: alarm? telemetri?
      return {
        data: null,
        errors: [
          { id: 'signee_list.parse_error' },
          {
            id: 'general.customer_service_error_message',
            params: [
              'general.customer_service_phone_number',
              'general.customer_service_email',
              'general.customer_service_slack',
            ],
          },
        ],
      };
    }

    const sortedSigneeStates = parsed.data.signeeStates.toSorted((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

    return { errors: null, data: sortedSigneeStates };
  } catch (error) {
    const parsed = problemDetailsSchema.safeParse(error.response.data);

    if (!parsed.success) {
      throw new Error('signee_list.unknown_api_error');
    }
    throw new Error(parsed.data.detail);
  }
}

const signeeListQueries = {
  all: (partyId: string, instanceGuid: string) =>
    queryOptions({
      queryKey: ['signeeList', partyId, instanceGuid],
      queryFn: () => fetchSigneeList(partyId, instanceGuid),
    }),
};

type SigneeListComponentProps = PropsFromGenericComponent<'SigneeList'>;

export function SigneeListComponent({ node }: SigneeListComponentProps) {
  const { partyId, instanceGuid } = useParams();
  const taskType = useTaskTypeFromBackend();
  const { langAsString } = useLanguage();
  const { textResourceBindings } = useNodeItem(node);

  const { data: result, error: apiError } = useQuery({
    ...signeeListQueries.all(partyId!, instanceGuid!),
    enabled: taskType === ProcessTaskType.Signing,
  });

  if (taskType !== ProcessTaskType.Signing) {
    return <Lang id='signee_list.wrong_task_error' />;
  }

  if (apiError) {
    window.logErrorOnce(langAsString(apiError.message));
    return <Lang id='signee_list.api_error_display' />;
  }

  if (result?.errors) {
    return (
      <div>
        {result.errors.map((it, idx) => (
          <>
            <Lang
              key={it.id}
              id={it.id}
              params={it.params?.map((it) => (
                <Lang
                  key={it?.toString()}
                  id={it?.toString()}
                />
              ))}
            />
            {idx === 0 && <br />}
          </>
        ))}
      </div>
    );
  }

  return (
    <AppTable
      size='md'
      data={result?.data ?? []}
      headerClassName={classes.signeeListHeader}
      caption={
        textResourceBindings?.title ? (
          <Caption
            title={<Lang id={textResourceBindings?.title} />}
            designSystemLabelProps={{ className: classes.signeeListCaption }}
            description={<Lang id={textResourceBindings?.description} />}
            helpText={textResourceBindings?.help ? { text: textResourceBindings?.help } : undefined}
          />
        ) : undefined
      }
      columns={[
        {
          header: langAsString('signee_list.header_name'),
          accessors: ['name'],
          renderCell: (value) => value.toString(),
        },
        {
          header: langAsString('signee_list.header_on_behalf_of'),
          accessors: ['organisation'],
          renderCell: (value) => value.toString(),
        },
        {
          header: langAsString('signee_list.header_status'),
          accessors: [],
          renderCell: (_, rowData) => <SigneeStateTag state={rowData} />,
        },
      ]}
    />
  );
}
