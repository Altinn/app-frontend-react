import React from 'react';

import { Heading } from '@digdir/design-system-react';
import cn from 'classnames';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { Fieldset } from 'src/components/form/Fieldset';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Group/DisplayGroupContainer.module.css';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { HeadingLevel } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IDisplayGroupContainer {
  groupNode: LayoutNode<'Group'>;
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

export function DisplayGroupContainer({
  groupNode,
  id,
  onlyRowIndex,
  isSummary,
  renderLayoutNode,
}: IDisplayGroupContainer) {
  const container = groupNode.item;
  const { title, summaryTitle, description } = container.textResourceBindings ?? {};

  if (groupNode.isHidden()) {
    return null;
  }

  const isNested = groupNode.parent instanceof BaseLayoutNode;
  const isPanel = container.groupingIndicator === 'panel';
  const isIndented = container.groupingIndicator === 'indented';
  const headingLevel = Math.min(Math.max(groupNode.parents().length + 1, 2), 6) as HeadingLevel;
  const headingSize = headingSizes[headingLevel];
  const legend = isSummary ? summaryTitle : title;

  return (
    <ConditionalWrapper
      condition={isPanel}
      wrapper={(child) => <FullWidthWrapper className={classes.panelPadding}>{child}</FullWidthWrapper>}
    >
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
        className={cn(isSummary ? classes.summary : classes.group, { [classes.panel]: isPanel })}
        description={description && !isSummary && <Lang id={description} />}
      >
        <div
          id={id || container.id}
          data-componentid={container.id}
          data-testid='display-group-container'
          className={cn({ [classes.groupingIndicator]: isIndented && !isNested }, classes.groupContainer)}
        >
          {groupNode.children(undefined, onlyRowIndex).map((n) => renderLayoutNode(n))}
        </div>
      </Fieldset>
    </ConditionalWrapper>
  );
}
