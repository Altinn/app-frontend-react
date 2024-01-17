import React from 'react';

import { Heading } from '@digdir/design-system-react';

import { Fieldset } from 'src/components/form/Fieldset';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Group/GroupComponent.module.css';
import type { HeadingLevel } from 'src/layout/common.generated';
import type { CompLikertGroupInternal } from 'src/layout/LikertGroup/config.generated';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IDisplayLikertGroupContainer {
  groupNode: BaseLayoutNode<CompLikertGroupInternal>;
  ref?: React.Ref<HTMLDivElement>;
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

export function DisplayLikertGroupContainer({
  ref,
  groupNode,
  id,
  onlyRowIndex,
  isSummary,
  renderLayoutNode,
}: IDisplayLikertGroupContainer) {
  const container = groupNode.item;
  const { title, summaryTitle, description } = container.textResourceBindings ?? {};

  if (groupNode.isHidden()) {
    return null;
  }

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
            <Lang id={legend} />
          </Heading>
        )
      }
      className={isSummary ? classes.summary : classes.group}
      description={description && !isSummary && <Lang id={description} />}
    >
      <div
        ref={ref}
        id={id || container.id}
        data-componentid={container.id}
        data-testid='display-group-container'
        className={classes.groupContainer}
      >
        {groupNode.children(undefined, onlyRowIndex).map((n) => renderLayoutNode(n))}
      </div>
    </Fieldset>
  );
}
