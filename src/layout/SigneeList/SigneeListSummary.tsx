import React from 'react';
import { useParams } from 'react-router-dom';
import type { PropsWithChildren, ReactElement } from 'react';

import { Divider, Paragraph } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale/nb';

import { Label } from 'src/app-components/Label/Label';
import { Lang } from 'src/features/language/Lang';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import classes from 'src/layout/SigneeList/SigneeListSummary.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { SigneeState } from 'src/layout/SigneeList/api';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface SigneeListSummaryProps {
  componentNode: LayoutNode<'SigneeList'>;
}

export function SigneeListSummary({ componentNode }: SigneeListSummaryProps) {
  const { instanceOwnerPartyId, instanceGuid, taskId } = useParams();
  const { data, isLoading, error } = useQuery(signeeListQuery(instanceOwnerPartyId, instanceGuid, taskId));

  const summaryTitle = useNodeItem(componentNode, (i) => i.textResourceBindings?.summary_title);

  const signatures = data?.filter((signee) => isSignedSignee(signee)) ?? [];
  const heading = <Lang id={summaryTitle ?? 'signee_list_summary.header'} />;

  if (isLoading) {
    return (
      <SigneeListSummaryContainer heading={heading}>
        <Paragraph>
          <Lang id='signee_list_summary.loading' />
        </Paragraph>
      </SigneeListSummaryContainer>
    );
  }

  if (error) {
    return (
      <SigneeListSummaryContainer heading={heading}>
        <Paragraph>
          <Lang id='signee_list_summary.error' />
        </Paragraph>
      </SigneeListSummaryContainer>
    );
  }

  if (signatures.length === 0) {
    return (
      <SigneeListSummaryContainer heading={heading}>
        <Paragraph>
          <Lang id='signee_list_summary.no_signatures' />
        </Paragraph>
      </SigneeListSummaryContainer>
    );
  }

  return (
    <SigneeListSummaryContainer heading={heading}>
      <ul className={classes.signeeList}>
        {signatures.map((item, index) => (
          <li
            key={`${item.name}-${item.organisation}-${item.signedTime}`}
            className={classes.signeeListItem}
          >
            <Paragraph key={index}>
              {item.name ?? <Lang id='signee_list_summary.name_placeholder' />}
              {item.organisation && (
                <>
                  , <Lang id='signee_list_summary.on_behalf_of' />
                  {` ${item.organisation}`}
                </>
              )}
            </Paragraph>
            <Divider className={classes.divider} />
            <Paragraph className={classes.signeeDescription}>
              <Lang
                id='signee_list_summary.signed_time'
                params={[format(new Date(item.signedTime), "dd.MM.yyyy 'kl.' HH:mm", { locale: nb })]}
              />
            </Paragraph>
          </li>
        ))}
      </ul>
    </SigneeListSummaryContainer>
  );
}

function SigneeListSummaryContainer({ heading, children }: PropsWithChildren<{ heading: ReactElement }>) {
  return (
    <div>
      <Label
        label={heading}
        size='lg'
      />
      {children}
    </div>
  );
}

type SignedSignee = SigneeState & { signedTime: string };

function isSignedSignee(signee: SigneeState): signee is SignedSignee {
  return signee.signedTime !== null;
}
