import React from 'react';
import { useParams } from 'react-router-dom';

import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { AppTable } from 'src/app-components/Table/Table';
import { useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/layout/SigneeList/SigneeListComponent.module.css';
import { SigneeStateTag } from 'src/layout/SigneeList/SigneeStateTag';
import { ProcessTaskType } from 'src/types';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath } from 'src/utils/urls/appUrlHelper';
import type { LangProps } from 'src/features/language/Lang';
import type { PropsFromGenericComponent } from 'src/layout';

/*
TODO:
- Hvilke kolonner skal vi ha?
- Gå gjennom feilhåndtering
- Unit tests?
- Cypress tests
*/

const signeeStateSchema = z.object({
  name: z.string(),
  hasSigned: z.boolean(),
  delegationSuccessful: z.boolean(),
  notificationSuccessful: z.boolean(),
});

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

    return { errors: null, data: parsed.data.signeeStates };
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

export function SigneeListComponent(_props: SigneeListComponentProps) {
  const { partyId, instanceGuid } = useParams();
  const taskType = useTaskTypeFromBackend();
  const { langAsString } = useLanguage();

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
              params={it.params?.map((it, idx) => (
                <Lang
                  key={idx}
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
      data={result?.data ?? []}
      headerClassName={classes.signeeListHeader}
      columns={[
        { header: 'Name', accessors: ['name'] },
        {
          header: 'Status',
          accessors: ['hasSigned', 'delegationSuccessful', 'notificationSuccessful'],
          renderCell: (_, rowData) => <SigneeStateTag state={rowData} />,
        },
      ]}
    />
  );
}
