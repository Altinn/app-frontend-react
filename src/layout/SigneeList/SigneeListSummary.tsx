import React from 'react';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { useLanguage } from 'src/features/language/useLanguage';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import classes from 'src/layout/SigneeList/SigneeListComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface SigneeListSummaryProps {
  componentNode: LayoutNode<'SigneeList'>;
}

export function SigneeListSummary({ componentNode }: SigneeListSummaryProps) {
  const { partyId, instanceGuid } = useParams();
  const { langAsString } = useLanguage();
  const { data, isLoading, error } = useQuery(signeeListQuery(partyId!, instanceGuid!));
  const summaryTitle = useNodeItem(componentNode, (i) => i.textResourceBindings?.summary_title);

  return (
    <div>
      <h2 className={classes.summaryHeader}>
        {summaryTitle ?? langAsString('signee_list_summary.header').toLocaleUpperCase()}
      </h2>
      <hr className={classes.summaryDivider} />
      {isLoading && <p>{langAsString('signee_list_summary.loading')}</p>}
      {error && <p>{langAsString('signee_list_summary.error')}</p>}
      {!data || data.length === 0 ? <p>{langAsString('signee_list_summary.no_data')}</p> : null}
      {!anySignatures(data) && <p>{langAsString('signee_list_summary.no_signatures')}</p>}
      {data &&
        data.map((item, index) => (
          <p key={index}>
            {item.hasSigned &&
              (item.name?.toLocaleUpperCase() ??
                langAsString('signee_list_summary.name_placeholder').toLocaleUpperCase())}
            {item.organisation
              ? `${langAsString('signee_list_summary.on_behalf_of')} ${item.organisation.toLocaleUpperCase()}`
              : ''}
          </p>
        ))}
    </div>
  );

  function anySignatures(
    data:
      | {
          hasSigned: boolean;
          delegationSuccessful: boolean;
          notificationSuccessful: boolean;
          name?: string | null | undefined;
          organisation?: string | null | undefined;
        }[]
      | undefined,
  ) {
    return data?.some((item) => item.hasSigned);
  }
}
