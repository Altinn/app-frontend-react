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
import { SigneeListError } from 'src/layout/SigneeList/SigneeListError';
import { SigneeStateTag } from 'src/layout/SigneeList/SigneeStateTag';
import { ProcessTaskType } from 'src/types';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { appPath } from 'src/utils/urls/appUrlHelper';
import type { PropsFromGenericComponent } from 'src/layout';

// TODO: Cypress tests: Needs finished APIs.

const signeeStateSchema = z
  .object({
    name: z.string().nullish(),
    organisation: z.string().nullish(),
    hasSigned: z.boolean(),
    delegationSuccessful: z.boolean(),
    notificationSuccessful: z.boolean(),
  })
  .refine(({ name, organisation }) => name || organisation, 'Either name or organisation must be present.');

export const problemDetailsSchema = z.object({
  detail: z.string(),
  status: z.number(),
  title: z.string(),
});

export type SigneeState = z.infer<typeof signeeStateSchema>;

async function fetchSigneeList(partyId: string, instanceGuid: string): Promise<SigneeState[]> {
  const url = `${appPath}/instances/${partyId}/${instanceGuid}/signing`;

  const response = await httpGet(url);
  const parsed = z.object({ signeeStates: z.array(signeeStateSchema) }).parse(response);

  return parsed.signeeStates.toSorted((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
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

  const {
    data: result,
    isLoading,
    error: apiError,
  } = useQuery({
    ...signeeListQueries.all(partyId!, instanceGuid!),
    enabled: taskType === ProcessTaskType.Signing,
  });

  if (taskType !== ProcessTaskType.Signing) {
    return <Lang id='signee_list.wrong_task_error' />;
  }

  if (apiError) {
    return <SigneeListError error={apiError} />;
  }

  return (
    <AppTable
      size='md'
      data={result ?? []}
      isLoading={isLoading}
      headerClassName={classes.header}
      tableClassName={classes.table}
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
