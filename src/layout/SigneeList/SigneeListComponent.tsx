import React from 'react';
import { useParams } from 'react-router-dom';

import { Tag } from '@digdir/designsystemet-react';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import type { TagProps } from '@digdir/designsystemet-react';

import { AppTable } from 'src/app-components/Table/Table';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/SigneeList/SigneeListComponent.module.css';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath } from 'src/utils/urls/appUrlHelper';
import type { LangProps } from 'src/features/language/Lang';
import type { PropsFromGenericComponent } from 'src/layout';

/*
TODO:
- Språk
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
  doesntExist: z.boolean(),
});

type SigneeState = z.infer<typeof signeeStateSchema>;

type SigneeListResponse = { error: null; data: SigneeState[] } | { error: LangProps; data: null };

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
        error: {
          id: 'config_error.layoutset_subform_config_error_customer_support',
          params: [
            'general.customer_service_phone_number',
            'general.customer_service_email',
            'general.customer_service_slack',
          ],
        },
      };
    }

    return { error: null, data: parsed.data.signeeStates };
  } catch (error) {
    const parsed = problemDetailsSchema.safeParse(error.response.data);

    if (!parsed.success) {
      throw new Error('An error occurred when fetching signees.');
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

  const { data: result, error: apiError } = useQuery(signeeListQueries.all(partyId!, instanceGuid!));

  if (apiError) {
    window.logErrorOnce(apiError.message);
    return <div>Det skjedde en feil. Se devtool-logger for mer informasjon.</div>;
  }

  if (result?.error) {
    return (
      <Lang
        id={result.error.id}
        params={result.error.params?.map((it, idx) => (
          <Lang
            key={idx}
            id={it?.toString()}
          />
        ))}
      />
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

const signeeStatus = {
  signed: 'Har signert',
  waiting: 'Venter på signatur',
  delegationFailed: 'Delegering feilet', // TODO: How do we handle this?
  notificationFailed: 'Varsling feilet',
};

type SigneeStatus = keyof typeof signeeStatus;

function getSigneeStatus(state: SigneeState): SigneeStatus {
  if (state.hasSigned) {
    return 'signed';
  }
  if (!state.delegationSuccessful) {
    return 'delegationFailed';
  }
  if (!state.notificationSuccessful) {
    return 'notificationFailed';
  }
  return 'waiting';
}

function SigneeStateTag({ state }: { state: SigneeState }) {
  const status = getSigneeStatus(state);

  let color: TagProps['color'] = 'neutral';
  switch (status) {
    case 'signed':
      color = 'success';
      break;
    case 'delegationFailed':
      color = 'danger';
      break;
    case 'notificationFailed':
      color = 'warning';
      break;
    default:
      color = 'neutral';
  }

  return (
    <Tag
      color={color}
      size='sm'
    >
      {signeeStatus[status]}
    </Tag>
  );
}
