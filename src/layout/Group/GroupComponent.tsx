import React from 'react';
import type { JSX } from 'react';

import { Heading } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { Fieldset } from 'src/components/form/Fieldset';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Group/GroupComponent.module.css';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { Hidden } from 'src/utils/layout/NodesContext';
import { useNodeDirectChildren, useNodeItem } from 'src/utils/layout/useNodeItem';
import type { NodeRef } from 'src/layout';
import type { HeadingLevel } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IGroupComponent {
  groupNode: LayoutNode<'Group'>;
  containerDivRef?: React.Ref<HTMLDivElement>;
  id?: string;
  onlyInRowUuid?: string;
  isSummary?: boolean;
  renderLayoutNode: (nodeRef: NodeRef) => JSX.Element | null;
}

const headingSizes: { [k in HeadingLevel]: Parameters<typeof Heading>[0]['size'] } = {
  [2]: 'medium',
  [3]: 'small',
  [4]: 'xsmall',
  [5]: 'xsmall',
  [6]: 'xsmall',
};

export function GroupComponent({
  groupNode,
  containerDivRef,
  id,
  onlyInRowUuid,
  isSummary,
  renderLayoutNode,
}: IGroupComponent) {
  const container = useNodeItem(groupNode);
  const { title, summaryTitle, description } = container.textResourceBindings ?? {};
  const isHidden = Hidden.useIsHidden(groupNode);

  const restriction = typeof onlyInRowUuid === 'string' ? { onlyInRowUuid } : undefined;
  const children = useNodeDirectChildren(groupNode, restriction);

  if (isHidden) {
    return null;
  }

  const isNested = groupNode.parent instanceof BaseLayoutNode;
  const isPanel = container.groupingIndicator === 'panel';
  const isIndented = container.groupingIndicator === 'indented';
  const headingLevel =
    container.headingLevel ?? (Math.min(Math.max(groupNode.parents().length + 1, 2), 6) as HeadingLevel);
  const headingSize = headingSizes[headingLevel];
  const legend = isSummary ? summaryTitle ?? title : title;

  return (
    <ConditionalWrapper
      condition={isPanel && !isSummary}
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
        className={cn(isSummary ? classes.summary : classes.group, { [classes.panel]: isPanel && !isSummary })}
        description={description && !isSummary && <Lang id={description} />}
      >
        <div
          ref={containerDivRef}
          id={id || container.id}
          data-componentid={container.id}
          data-testid='display-group-container'
          className={cn({ [classes.groupingIndicator]: isIndented && !isNested }, classes.groupContainer)}
        >
          {children?.map((n) => renderLayoutNode(n))}
        </div>
      </Fieldset>
    </ConditionalWrapper>
  );
}
