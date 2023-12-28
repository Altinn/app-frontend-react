import React from 'react';

import { Fieldset, Heading } from '@digdir/design-system-react';
import cn from 'classnames';

import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/RepeatingGroup/Summary/DisplayRepAsLargeGroup.module.css';
import { pageBreakStyles } from 'src/utils/formComponentUtils';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { HeadingLevel } from 'src/layout/common.generated';
import type { CompRepeatingGroupInternal } from 'src/layout/RepeatingGroup/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IDisplayRepAsLargeGroup {
  groupNode: BaseLayoutNode<CompRepeatingGroupInternal>;
  id?: string;
  onlyRowIndex?: number | undefined;
  isSummary?: boolean;
  renderLayoutNode: (node: LayoutNode) => JSX.Element | null;
}

const headingSizes: { [k in HeadingLevel]: Parameters<typeof Heading>[0]['size'] } = {
  [2]: 'medium',
  [3]: 'small',
  [4]: 'xsmall',
  [5]: 'xsmall',
  [6]: 'xsmall',
};

export function DisplayRepAsLargeGroup({
  groupNode,
  id,
  onlyRowIndex,
  isSummary,
  renderLayoutNode,
}: IDisplayRepAsLargeGroup) {
  if (groupNode.isHidden()) {
    return null;
  }
  const container = groupNode.item;
  const { title, description, summaryTitle } = container.textResourceBindings || {};

  const isNested = groupNode.parent instanceof BaseLayoutNode;
  const headingLevel = Math.min(Math.max(groupNode.parents().length + 1, 2), 6) as HeadingLevel;
  const headingSize = headingSizes[headingLevel];
  const legend = isSummary ? summaryTitle : title;

  return (
    <Fieldset
      legend={
        legend && (
          <Heading
            level={headingLevel}
            size={headingSize}
          >
            <Lang id={summaryTitle} />
          </Heading>
        )
      }
      className={cn(pageBreakStyles(container.pageBreak), {
        [classes.largeGroupContainer]: !isNested,
        [classes.summary]: isSummary,
        [classes.group]: !isSummary,
      })}
      description={description && <Lang id={description} />}
    >
      <div
        id={id || container.id}
        className={classes.largeGroupContainer}
      >
        {groupNode.children(undefined, onlyRowIndex).map((n) => renderLayoutNode(n))}
      </div>
    </Fieldset>
  );
}
