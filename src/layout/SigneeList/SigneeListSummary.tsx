import React from 'react';
import { useParams } from 'react-router-dom';

import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';

import { Lang } from 'src/features/language/Lang';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import classes from 'src/layout/SigneeList/SigneeListComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface SigneeListSummaryProps {
  componentNode: LayoutNode<'SigneeList'>;
}

export function SigneeListSummary({ componentNode }: SigneeListSummaryProps) {
  const { partyId, instanceGuid, taskId } = useParams();
  const { data, isLoading, error } = useQuery(signeeListQuery(partyId, instanceGuid, taskId));

  const summaryTitle = useNodeItem(componentNode, (i) => i.textResourceBindings?.summary_title);

  return (
    <div>
      <Heading
        level={2}
        size='sm'
        className={classes.summaryHeader}
      >
        {summaryTitle ?? <Lang id='signee_list_summary.header' />}
      </Heading>
      <hr className={classes.summaryDivider} />

      {isLoading ? (
        <Paragraph>
          <Lang id='signee_list_summary.loading' />
        </Paragraph>
      ) : error ? (
        <Paragraph>
          <Lang id='signee_list_summary.error' />
        </Paragraph>
      ) : !data || data.length === 0 ? (
        <Paragraph>
          <Lang id='signee_list_summary.no_data' />
        </Paragraph>
      ) : !anySignatures(data) ? (
        <Paragraph>
          <Lang id='signee_list_summary.no_signatures' />
        </Paragraph>
      ) : (
        data.map((item, index) => (
          <Paragraph key={index}>
            {item.hasSigned &&
              `${item.name?.toLocaleUpperCase() ?? <Lang id='signee_list_summary.name_placeholder' />} `}
            {item.organisation ? (
              <>
                <Lang id='signee_list_summary.on_behalf_of' />
                {` ${item.organisation.toLocaleUpperCase()}`}
              </>
            ) : null}
          </Paragraph>
        ))
      )}
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
