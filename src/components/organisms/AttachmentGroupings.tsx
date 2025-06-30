import React from 'react';
import type { JSX } from 'react';

import { Heading } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { AltinnCollapsibleAttachments } from 'src/components/molecules/AltinnCollapsibleAttachments';
import classes from 'src/components/organisms/AttachmentGroupings.module.css';
import { useLanguage } from 'src/features/language/useLanguage';
import type { IDisplayAttachment } from 'src/types/shared';

interface IRenderAttachmentGroupings {
  attachments: IDisplayAttachment[] | undefined;
  title: JSX.Element | undefined;
  hideCollapsibleCount?: boolean;
  showLinks: boolean | undefined;
  showDescription?: boolean;
}

const defaultGroupingKey = 'null';

export const AttachmentGroupings = ({
  attachments = [],
  title,
  hideCollapsibleCount,
  showLinks = true,
  showDescription = false,
}: IRenderAttachmentGroupings) => {
  const langTools = useLanguage();

  const groupings = attachments?.reduce<Record<string, IDisplayAttachment[]>>((acc, attachment) => {
    const grouping = attachment.grouping ?? defaultGroupingKey;
    const translatedGrouping = langTools.langAsString(grouping);
    if (!acc[translatedGrouping]) {
      acc[translatedGrouping] = [];
    }
    acc[translatedGrouping].push(attachment);
    return acc;
  }, {});

  function sortDefaultGroupingFirst(a: string, b: string) {
    if (a === defaultGroupingKey) {
      return -1;
    }
    if (b === defaultGroupingKey) {
      return 1;
    }
    return 0;
  }

  if (!Object.entries(groupings).length) {
    return null;
  }
  const attachmentsWithoutGrouping = groupings[defaultGroupingKey] ?? [];
  const hasAnyDocumentsWithoutGrouping = attachmentsWithoutGrouping.length > 0;
  const noGroupingAttachmentCount =
    !hideCollapsibleCount && attachmentsWithoutGrouping.length > 0 ? `(${attachmentsWithoutGrouping.length})` : '';

  return (
    <>
      {title && (
        <Heading
          level={2}
          data-size='sm'
          className={cn({ [classes.paddingBottom]: !hasAnyDocumentsWithoutGrouping })}
        >
          {title}&nbsp;{noGroupingAttachmentCount}
        </Heading>
      )}
      <ul className={classes.groupList}>
        {Object.keys(groupings)
          .sort(sortDefaultGroupingFirst)
          .map((groupTitle) => (
            <li key={groupTitle}>
              <AltinnCollapsibleAttachments
                attachments={groupings[groupTitle]}
                title={groupTitle === defaultGroupingKey ? undefined : groupTitle}
                hideCount={hideCollapsibleCount}
                showLinks={showLinks}
                showDescription={showDescription}
              />
            </li>
          ))}
      </ul>
    </>
  );
};
