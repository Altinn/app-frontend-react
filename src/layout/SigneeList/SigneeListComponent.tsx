import React from 'react';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { AppTable } from 'src/app-components/Table/Table';
import { Caption } from 'src/components/form/caption/Caption';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import classes from 'src/layout/SigneeList/SigneeListComponent.module.css';
import { SigneeListError } from 'src/layout/SigneeList/SigneeListError';
import { SigneeStateTag } from 'src/layout/SigneeList/SigneeStateTag';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

// TODO: Cypress tests: Needs finished APIs.

export function SigneeListComponent({ node }: PropsFromGenericComponent<'SigneeList'>) {
  const { instanceOwnerPartyId, instanceGuid, taskId } = useParams();
  const { langAsString } = useLanguage();

  const { textResourceBindings } = useNodeItem(node);

  const { data, isLoading, error } = useQuery(signeeListQuery(instanceOwnerPartyId, instanceGuid, taskId));

  if (error) {
    return <SigneeListError error={error} />;
  }

  return (
    <AppTable
      size='md'
      data={data ?? []}
      isLoading={isLoading}
      emptyText={<Lang id='signee_list.no_signees' />}
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
